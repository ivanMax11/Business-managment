import { NextResponse } from 'next/server';
import { PrismaClient, TipoMovimiento } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productoId, cantidad, motivo, usuario, cliente } = body;

    if (!productoId || !cantidad || cantidad <= 0 || !cliente?.nombre) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Buscar producto
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    if (producto.stock < cantidad) {
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

    // Registra la venta
    const venta = await prisma.venta.create({
      data: {
        productoId,
        cantidad,
        clienteId: clienteExistente.id,
        fecha: new Date(),
      },
    });

    // Actualizar stock del producto
    await prisma.producto.update({
      where: { id: productoId },
      data: {
        stock: {
          decrement: cantidad,
        },
      },
    });

    // Registrar movimiento de stock tipo SALIDA
    await prisma.movimientoStock.create({
      data: {
        producto_id: productoId,
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
