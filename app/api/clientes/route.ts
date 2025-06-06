import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: listar clientes con ventas
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ventas: true, // Incluimos las ventas relacionadas
      },
    });

    const clientesConVentas = clientes.map(cliente => ({
      ...cliente,
      ventas: cliente.ventas || [], // Aseguramos que siempre tenga ventas como array
    }));

    return NextResponse.json(clientesConVentas);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
}

// POST: crear cliente
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, telefono, direccion } = body;

    const nuevoCliente = await prisma.cliente.create({
      data: { nombre, telefono, direccion },
    });

    return NextResponse.json(nuevoCliente, { status: 201 });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    );
  }
}
