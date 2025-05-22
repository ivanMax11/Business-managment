import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // 📦 Productos totales y con stock bajo
    const totalProducts = await prisma.producto.count();
    const lowStockItems = await prisma.producto.count({
      where: {
        stock: {
          lt: 5,
        },
      },
    });

    // 🔄 Movimientos de stock de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMovements = await prisma.movimientoStock.count({
      where: {
        fecha: {
          gte: today,
        },
      },
    });

    // 📅 Fechas clave
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 🧾 Ventas del mes actual
    const ventasDelMes = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        producto: true,
      },
    });

    const monthlySales = ventasDelMes.length;

    // 🧾 Ventas del mes anterior
    const ventasMesAnterior = await prisma.venta.count({
      where: {
        fecha: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // 💰 Ingresos mensuales
    const monthlyRevenue = ventasDelMes.reduce((total, venta) => {
      return total + venta.cantidad * (venta.producto?.precio || 0);
    }, 0);

    // 🧾 Ganancia neta
    const monthlyProfit = ventasDelMes.reduce((total, venta) => {
      const precioVenta = venta.producto?.precio || 0;
      const costo = venta.producto?.costo || 0;
      return total + venta.cantidad * (precioVenta - costo);
    }, 0);

    // Ingresos del mes anterior
    const ventasMesAnteriorDetalladas = await prisma.venta.findMany({
  where: {
    fecha: {
      gte: startOfLastMonth,
      lte: endOfLastMonth,
    },
  },
  include: {
    producto: true,
  },
});

const revenueLastMonth = ventasMesAnteriorDetalladas.reduce((total, venta) => {
  return total + venta.cantidad * (venta.producto?.precio || 0);
}, 0);

const profitLastMonth = ventasMesAnteriorDetalladas.reduce((total, venta) => {
  const precioVenta = venta.producto?.precio || 0;
  const costo = venta.producto?.costo || 0;
  return total + venta.cantidad * (precioVenta - costo);
}, 0);

// 📈 Porcentajes de crecimiento adicionales
const revenueGrowth =
  revenueLastMonth > 0
    ? ((monthlyRevenue - revenueLastMonth) / revenueLastMonth) * 100
    : monthlyRevenue > 0
    ? 100
    : 0;

const profitGrowth =
  profitLastMonth > 0
    ? ((monthlyProfit - profitLastMonth) / profitLastMonth) * 100
    : monthlyProfit > 0
    ? 100
    : 0;

    // 🧍‍♂️ Clientes totales
    const totalCustomers = await prisma.cliente.count();

    // 🧍‍♂️ Nuevos clientes este mes
    const customersThisMonth = await prisma.cliente.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // 🧍‍♂️ Nuevos clientes el mes anterior
    const customersLastMonth = await prisma.cliente.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // 📈 Porcentajes de crecimiento
    const salesGrowth =
      ventasMesAnterior > 0
        ? ((monthlySales - ventasMesAnterior) / ventasMesAnterior) * 100
        : monthlySales > 0
        ? 100
        : 0;

    const customersGrowth =
      customersLastMonth > 0
        ? ((customersThisMonth - customersLastMonth) / customersLastMonth) * 100
        : customersThisMonth > 0
        ? 100
        : 0;

    // ✅ Devolver todo organizado
    return NextResponse.json({
      totalProducts,
      lowStockItems,
      todayMovements,
      totalCustomers,
      monthlySales,
      monthlyRevenue,
      monthlyProfit,
      salesGrowth,
      customersGrowth,
      revenueGrowth,
      profitGrowth
    });
  } catch (error) {
    console.error('[DASHBOARD_STATS_ERROR]', error);
    return NextResponse.json(
      { error: 'Error cargando estadísticas del dashboard' },
      { status: 500 }
    );
  }
}
