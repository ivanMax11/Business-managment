import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const variantes = await prisma.varianteProducto.findMany({
      where: { talla: { not: null } },
      select: { talla: true },
      distinct: ['talla'],
    });

    const tallas = variantes
      .map((v) => v.talla?.trim())
      .filter(Boolean) as string[];

    return NextResponse.json(tallas);
  } catch (error) {
    console.error('Error al cargar tallas:', error);
    return NextResponse.json({ error: 'Error al cargar tallas' }, { status: 500 });
  }
}
