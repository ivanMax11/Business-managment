import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const productoId = parseInt(params.id);

    if (isNaN(productoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const variantes = await prisma.varianteProducto.findMany({
      where: {
        productoId: productoId,
      },
      select: {
        id: true,
        color: true,
        talla: true,
        stock: true,
      },
    });

    return NextResponse.json(variantes);
  } catch (error) {
    console.error('[GET_VARIANTES_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al obtener variantes' },
      { status: 500 }
    );
  }
}
