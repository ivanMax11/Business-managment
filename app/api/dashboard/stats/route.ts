import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; 

export async function GET() {
  try {
    const totalProducts = await prisma.producto.count();

    const lowStockItems = await prisma.producto.count({
      where: {
        stock: {
          lt: 5,
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMovements = await prisma.movimientoStock.count({
      where: {
        fecha: {
          gte: today,
        },
      },
    });

    // Si no hay modelo de venta ni cliente aún:
    const monthlySales = 0;
    const totalCustomers = 0;
    const monthlyRevenue = 0;

    return NextResponse.json({
      totalProducts,
      lowStockItems,
      todayMovements,
      monthlySales,
      totalCustomers,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('[DASHBOARD_STATS_ERROR]', error);
    return NextResponse.json(
      { error: 'Error cargando estadísticas del dashboard' },
      { status: 500 }
    );
  }
}
