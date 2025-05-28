import { NextResponse } from 'next/server';
import { PrismaClient, TipoMovimiento } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { varianteId, cantidad, motivo, usuario, cliente } = body;

    console.log('Body recibido en /api/ventas:', body);

    if (!varianteId || !cantidad || cantidad <= 0 || !cliente?.nombre) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Buscar variante con producto relacionado (mover esto arriba)
    const variante = await prisma.varianteProducto.findUnique({
      where: { id: varianteId },
      select: {
        id: true,
        stock: true,
        productoId: true,
        producto: {
          select: { id: true, nombre: true }
        }
      },
    });

    if (!variante) {
      return NextResponse.json({ error: 'Variante no encontrada' }, { status: 404 });
    }

    if (variante.stock < cantidad) {
      console.log(`Stock insuficiente: variante ${variante.id} tiene ${variante.stock}, se pidió ${cantidad}`);
      return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 });
    }

    // Verificamos si el cliente ya existe (por nombre o email)
    let clienteExistente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { nombre: cliente.nombre },
          cliente.email ? { email: cliente.email } : undefined,
        ].filter(Boolean),
      },
    });

    // Si no existe lo creamos
    if (!clienteExistente) {
      clienteExistente = await prisma.cliente.create({
        data: {
          nombre: cliente.nombre,
          telefono: cliente.telefono || '',
          email: cliente.email || '',
        },
      });
    }

    // Registrar la venta con productoId y varianteId
    const venta = await prisma.venta.create({
      data: {
        varianteId: variante.id,
        cantidad,
        clienteId: clienteExistente.id,
        fecha: new Date(),
      },
    });

    // Actualizar stock de variante
    await prisma.varianteProducto.update({
      where: { id: varianteId },
      data: {
        stock: {
          decrement: cantidad,
        },
      },
    });

    // Registrar movimiento de stock tipo SALIDA
    await prisma.movimientoStock.create({
  data: {
    producto_id: variante.productoId,
    varianteId: variante.id,
    cantidad,
    tipo_movimiento: TipoMovimiento.SALIDA,
    motivo: motivo || 'Venta',
    usuario: usuario || 'sistema',
  },
});


    return NextResponse.json({ message: 'Venta registrada correctamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
