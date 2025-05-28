import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { productoSchema } from '@/app/lib/validations/productoSchema';
import { v4 as uuidv4, validate } from 'uuid';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const productos = await prisma.producto.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        fecha_creacion: 'desc',
      },
      include: {
        variantes: true,
      },
    });

    const total = await prisma.producto.count();

    return NextResponse.json({
      data: productos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsedBody = {
      ...body,
      precio: parseFloat(body.precio),
      costo: parseFloat(body.costo),
      variantes: body.variantes.map((v: any) => ({
        ...v,
        stock: parseInt(v.stock),
      })),
    };

    const validatedData = productoSchema.parse({
      ...parsedBody,
      codigo_barra: parsedBody.codigo_barra || uuidv4().slice(0, 12).toUpperCase(),
    });

    const producto = await prisma.producto.create({
      data: {
        codigo_barra: validatedData.codigo_barra,
        nombre: validatedData.nombre,
        descripcion: validatedData.descripcion,
        precio: validatedData.precio,
        costo: validatedData.costo,
        categoria: validatedData.categoria,
        variantes: {
          create: validatedData.variantes,
        },
      },
      include: {
        variantes: true,
      },
    });

    // Crear movimientos por cada variante con stock > 0
    for (const variante of producto.variantes) {
      if (variante.stock > 0) {
        await prisma.movimientoStock.create({
          data: {
            producto_id: producto.id,
            varianteId: variante.id,
            cantidad: variante.stock,
            tipo_movimiento: 'ENTRADA',
            motivo: `Stock inicial de variante ${variante.color || ''}-${variante.talla || ''}`,
          },
        });
      }
    }

    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    console.error('Error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El código de barras ya existe' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}

