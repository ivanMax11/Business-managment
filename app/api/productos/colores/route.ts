import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const variantes = await prisma.varianteProducto.findMany({
      where: { color: { not: null } },
      select: { color: true },
      distinct: ['color'],
    });

    const colores = variantes
      .map((v) => v.color?.trim())
      .filter(Boolean) as string[];

    return NextResponse.json(colores);
  } catch (error) {
    console.error('Error al cargar colores:', error);
    return NextResponse.json({ error: 'Error al cargar colores' }, { status: 500 });
  }
}
