import { NextResponse } from 'next/server';
import { PrismaClient, TipoMovimiento } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { variantes, motivo, usuario, cliente } = body;

    console.log('Body recibido en /api/ventas:', body);

    if (
      !Array.isArray(variantes) ||
      variantes.length === 0 ||
      variantes.some(v => !v.varianteId || !v.cantidad || v.cantidad <= 0) ||
      !cliente?.nombre
    ) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // 📌 Buscar o crear cliente
    let clienteExistente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { nombre: cliente.nombre },
          ...(cliente.email ? [{ email: cliente.email }] : [])
        ],
      },
    });

    if (!clienteExistente) {
      clienteExistente = await prisma.cliente.create({
        data: {
          nombre: cliente.nombre,
          telefono: cliente.telefono || '',
          email: cliente.email || '',
        },
      });
    }

    const ventas: any[] = [];
    const movimientos: any[] = [];
    let totalCantidad = 0;

    // 🔄 Procesar variantes
    for (const v of variantes) {
      const variante = await prisma.varianteProducto.findUnique({
        where: { id: v.varianteId },
        select: {
          id: true,
          stock: true,
          productoId: true,
        },
      });

      if (!variante) {
        return NextResponse.json({ error: `Variante con ID ${v.varianteId} no encontrada` }, { status: 404 });
      }

      if (variante.stock < v.cantidad) {
        return NextResponse.json({ error: `Stock insuficiente para variante ${v.varianteId}` }, { status: 400 });
      }

      // Acumular venta
      ventas.push({
        varianteId: variante.id,
        clienteId: clienteExistente.id,
        cantidad: v.cantidad,
        precio_unitario: v.precio_unitario,
        fecha: new Date(),
      });

      // Acumular movimiento
      movimientos.push({
        producto_id: variante.productoId,
        varianteId: variante.id,
        cantidad: v.cantidad,
        tipo_movimiento: TipoMovimiento.SALIDA,
        motivo: motivo || 'Venta',
        usuario: usuario || 'sistema',
        fecha: new Date(),
      });

      // Actualizar stock
      await prisma.varianteProducto.update({
        where: { id: variante.id },
        data: {
          stock: {
            decrement: v.cantidad,
          },
        },
      });

      totalCantidad += v.cantidad;
    }

    // 🧾 Crear transacción única con ventas y movimientos
   const transaccion = await prisma.transaccion.create({
  data: {
    tipo: 'VENTA',
    clienteId: clienteExistente.id,
    fecha: new Date(),
    total: totalCantidad,
    ventas: { create: ventas },
    movimientos: { create: movimientos },
  },
  include: {
    cliente: true,
   ventas: {
  include: {
    variante: {
      include: {
        producto: true,
      },
    },
  },
   }
  }
});


   return NextResponse.json({
  message: 'Venta registrada correctamente',
  transaccion,
}, { status: 200 });

  } catch (error) {
    console.error('Error al registrar venta:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
