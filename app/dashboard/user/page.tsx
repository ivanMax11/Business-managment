'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPackage, FiAlertTriangle, FiRefreshCw, FiDollarSign, FiUsers, FiTrendingUp, FiList } from 'react-icons/fi';
import axios from 'axios';

export default function UserDashboard() {
  const [movimientos, setMovimientos] = useState([]);
  const [filtro, setFiltro] = useState('Hoy');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    todayMovements: 0,
    monthlySales: 0,
    customers: 0,
    revenue: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats({
          products: data.totalProducts || 0,
          lowStock: data.lowStockItems || 0,
          todayMovements: data.todayMovements || 0,
          monthlySales: data.monthlySales || 0,
          customers: data.totalCustomers || 0,
          revenue: data.monthlyRevenue || 0,
        });
      } catch (error) {
        console.error('Error al cargar estadísticas del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    axios.get('/api/movimientos')
      .then((res) => setMovimientos(res.data))
      .catch((err) => console.error('Error al cargar movimientos:', err));
  }, []);

  const movimientosFiltrados = movimientos.filter((mov: any) => {
    const fechaMov = new Date(mov.fecha);
    const ahora = new Date();

    switch (filtro) {
      case 'Hoy':
        return fechaMov.toDateString() === ahora.toDateString();

      case 'Esta semana': {
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        return fechaMov >= inicioSemana && fechaMov <= ahora;
      }

      case 'Este mes': {
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        return fechaMov >= inicioMes && fechaMov <= ahora;
      }

      case 'mes_pasado': {
        const inicioMesPasado = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        const finMesPasado = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);
        return fechaMov >= inicioMesPasado && fechaMov <= finMesPasado;
      }

      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Indumentaria</h1>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Productos Totales"
          value={stats.products.toString()}
          icon={<FiPackage className="text-blue-500" size={24} />}
          trend="up"
          percentage="5%"
        />
        <DashboardCard
          title="Stock Crítico"
          value={stats.lowStock.toString()}
          icon={<FiAlertTriangle className="text-red-500" size={24} />}
          alert
          trend="up"
          percentage="2%"
        />
        <DashboardCard
          title="Movimientos Hoy"
          value={stats.todayMovements.toString()}
          icon={<FiRefreshCw className="text-green-500" size={24} />}
        />
        <DashboardCard
          title="Ventas Mensuales"
          value={`$${stats.monthlySales.toLocaleString()}`}
          icon={<FiDollarSign className="text-purple-500" size={24} />}
          trend="up"
          percentage="12%"
        />
        <DashboardCard
          title="Clientes"
          value={stats.customers.toString()}
          icon={<FiUsers className="text-yellow-500" size={24} />}
          trend="up"
          percentage="8%"
        />
        <DashboardCard
          title="Ingresos Mensuales"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={<FiTrendingUp className="text-green-500" size={24} />}
          trend="up"
          percentage="15%"
        />
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Últimos Movimientos</h2>
            <select
              className="border rounded px-3 py-1 text-sm"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="Hoy">Hoy</option>
              <option value="Esta semana">Esta semana</option>
              <option value="Este mes">Este mes</option>
              <option value="mes_pasado">Mes pasado</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No hay movimientos recientes.
                    </td>
                  </tr>
                ) : (
                  movimientosFiltrados.map((mov: any) => (
                    <TableRow
                      key={mov.id}
                      product={mov.producto || 'Producto eliminado'}
                      type={mov.tipo}
                      quantity={mov.cantidad}
                      date={new Date(mov.fecha).toLocaleDateString()}
                      outgoing={mov.tipo === 'SALIDA'}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/products/new')}
              className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 btn-primary flex items-center justify-center gap-2 py-2 px-4 rounded transition"
            >
              <FiPackage /> Añadir Producto
            </button>
            <button
              onClick={() => router.push('/products')}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2 py-2 px-4 rounded transition"
            >
              <FiList /> Ver Todos los Productos
            </button>
            <button
              onClick={() => router.push('/dashboard/movimiento')}
              className="w-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center justify-center gap-2 py-2 px-4 rounded transition"
            >
              <FiRefreshCw /> Registrar Movimiento
            </button>
            <button
              onClick={() => router.push('/sales/new')}
              className="w-full bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center gap-2 py-2 px-4 rounded transition"
            >
              <FiDollarSign /> Nueva Venta
            </button>
            <button
              onClick={() => router.push('/sales')}
              className="w-full bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center gap-2 py-2 px-4 rounded transition"
            >
              <FiDollarSign /> Informe de Ventas
            </button>
            <button
              onClick={() => router.push('/clientes/')}
              className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center justify-center gap-2 py-2 px-4 rounded transition"
            >
              <FiUsers /> Nuestros Clientes
            </button>
          </div>
          <div className="mt-6">
            <h3 className="font-medium mb-2">Productos con Stock Bajo</h3>
            <ul className="space-y-2">
              <LowStockItem name="Camiseta Blanca M" currentStock={2} minStock={5} />
              <LowStockItem name="Jeans Negro 32" currentStock={3} minStock={5} />
            </ul>
          </div>
        </section>
      </div>

      {/* Gráficos y estadísticas */}
      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Ventas Mensuales</h2>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          {/* Aquí iría un gráfico con Chart.js o similar */}
          <span className="text-gray-500">Gráfico de Ventas Mensuales</span>
        </div>
      </section>

      {/* Productos más vendidos */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Productos Más Vendidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TopProduct
            name="Camiseta Básica Blanca"
            sales={120}
            revenue={2400}
          />
          <TopProduct
            name="Jeans Clásico Azul"
            sales={85}
            revenue={4250}
          />
          <TopProduct
            name="Vestido Floreado"
            sales={62}
            revenue={3100}
          />
        </div>
      </section>
    </div>
  );
}

// Componentes auxiliares
function DashboardCard({
  title,
  value,
  icon,
  alert = false,
  trend,
  percentage
}: {
  title: string,
  value: string,
  icon: React.ReactNode,
  alert?: boolean,
  trend?: 'up' | 'down',
  percentage?: string
}) {
  return (
    <div className={`p-4 rounded-lg border ${alert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-600 text-sm">{title}</h3>
          <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-600' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-full ${alert ? 'bg-red-100' : 'bg-blue-100'}`}>
          {icon}
        </div>
      </div>
      {trend && percentage && (
        <div className={`mt-2 text-xs flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? '↑' : '↓'} {percentage} vs mes anterior
        </div>
      )}
    </div>
  );
}

function TableRow({ product, type, quantity, date, outgoing = false }: {
  product: string,
  type: string,
  quantity: number,
  date: string,
  outgoing?: boolean
}) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${outgoing ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{date}</td>
    </tr>
  );
}

function LowStockItem({ name, currentStock, minStock }: {
  name: string,
  currentStock: number,
  minStock: number
}) {
  return (
    <li className="flex justify-between items-center p-2 bg-red-50 rounded">
      <span className="text-sm">{name}</span>
      <span className="text-xs font-medium text-red-600">
        {currentStock}/{minStock}
      </span>
    </li>
  );
}

function TopProduct({ name, sales, revenue }: {
  name: string,
  sales: number,
  revenue: number
}) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <h4 className="font-medium">{name}</h4>
      <div className="mt-2 flex justify-between text-sm">
        <span>Ventas: <strong>{sales}</strong></span>
        <span>Ingresos: <strong>${revenue.toLocaleString()}</strong></span>
      </div>
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500"
          style={{ width: `${Math.min(100, (sales / 150) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
}