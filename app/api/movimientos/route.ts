import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MovimientoDB {
  id: number;
  fecha: Date;
  tipo_movimiento: string;
  cantidad: number;
  motivo: string | null;
  producto: {
    nombre: string;
  };
}

interface MovimientoFormatted {
  id: number;
  fecha: Date;
  producto: string;
  tipo: string;
  cantidad: number;
  motivo: string | null;
  usuario: string; 
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit')) || 10;
  const periodo = searchParams.get('periodo');

  let fechaInicio: Date | undefined;
  let fechaFin: Date = new Date(); // Hoy por defecto

  // Definir el rango de fechas según el parámetro 'periodo'
  switch (periodo) {
    case 'hoy':
      fechaInicio = new Date();
      fechaInicio.setHours(0, 0, 0, 0); // Empieza desde medianoche de hoy
      break;

    case 'semana':
      fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - fechaInicio.getDay()); // Primer día de la semana (domingo)
      fechaInicio.setHours(0, 0, 0, 0); // Empieza desde la medianoche del primer día de la semana
      break;

    case 'mes':
      fechaInicio = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 1); // El primer día del mes actual
      break;

    case 'mes_pasado':
      fechaInicio = new Date(fechaFin.getFullYear(), fechaFin.getMonth() - 1, 1); // El primer día del mes pasado
      fechaFin = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 0, 23, 59, 59); // Último día del mes pasado
      break;
  }

  try {
    // Hacer la consulta con el filtro de fechas
    const movimientos = await prisma.movimientoStock.findMany({
      take: limit,
      where: fechaInicio
        ? {
            fecha: {
              gte: fechaInicio, // Fecha de inicio del período
              lte: fechaFin, // Fecha final del período
            },
          }
        : undefined,
      orderBy: {
        fecha: 'desc',
      },
      include: {
        producto: {
          select: {
            nombre: true,
          },
        },
        
      },
    });

    // Formatear los movimientos para la respuesta
  const formattedMovimientos: MovimientoFormatted[] = movimientos.map((mov: any) => ({
  id: mov.id,
  fecha: mov.fecha,
  producto: mov.producto.nombre,
  tipo: mov.tipo_movimiento,
  cantidad: mov.cantidad,
  motivo: mov.motivo,
  usuario: mov.usuario || 'Desconocido',
}));


    return NextResponse.json(formattedMovimientos);
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { producto_id, cantidad, tipo_movimiento, motivo, usuario } = body;

    if (!producto_id || !cantidad || !tipo_movimiento) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios.' },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: { id: producto_id },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado.' },
        { status: 404 }
      );
    }

    let nuevoStock = producto.stock;

    if (tipo_movimiento === 'ENTRADA') {
      nuevoStock += cantidad;
    } else if (tipo_movimiento === 'SALIDA') {
      if (producto.stock < cantidad) {
        return NextResponse.json(
          { error: 'Stock insuficiente para realizar salida.' },
          { status: 400 }
        );
      }
      nuevoStock -= cantidad;
    } else {
      return NextResponse.json(
        { error: 'Tipo de movimiento inválido.' },
        { status: 400 }
      );
    }

    const movimiento = await prisma.movimientoStock.create({
      data: {
        producto_id,
        cantidad,
        tipo_movimiento,
        motivo,
        usuario
      },
    });

    await prisma.producto.update({
      where: { id: producto_id },
      data: { stock: nuevoStock },
    });

    return NextResponse.json({
      message: 'Movimiento registrado exitosamente.',
      movimiento,
    });
  } catch (error) {
    console.error('[MOVIMIENTO_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al registrar el movimiento.' },
      { status: 500 }
    );
  }
}