'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Producto {
  id: number;
  nombre: string;
}

export default function NuevaVentaPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [venta, setVenta] = useState({
    varianteId: '',
    cantidad: 1,
    color: '',
    talle: '',
  });

  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    axios.get('/api/productos').then((res) => {
      console.log('Respuesta de productos:', res.data); // 🧪
      setProductos(res.data.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/ventas', {
        varianteId: parseInt(venta.varianteId),
        cantidad: venta.cantidad,
        color: venta.color,
        talle: venta.talle,
        motivo: 'Venta realizada',
        usuario: 'admin', // o el usuario autenticado
        cliente,
      });
      router.push('/dashboard/user');
    } catch (err) {
      console.error('Error al registrar venta', err);
      alert('Error al registrar la venta');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registrar Nueva Venta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block font-medium">Producto</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={venta.varianteId}
            onChange={(e) => setVenta({ ...venta, varianteId: e.target.value })}
            required
          >
            <option value="">Seleccione</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Cantidad</label>
          <input
            type="number"
            min={1}
            value={venta.cantidad}
            onChange={(e) =>
              setVenta({ ...venta, cantidad: Number(e.target.value) })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Color</label>
          <input
            type="text"
            value={venta.color}
            onChange={(e) => setVenta({ ...venta, color: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Ej: Rojo, Azul..."
            required
          />
        </div>

        <div>
          <label className="block font-medium">Talle</label>
          <input
            type="text"
            value={venta.talle}
            onChange={(e) => setVenta({ ...venta, talle: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Ej: S, M, L, XL..."
            required
          />
        </div>

        <hr className="my-4" />
        <h2 className="text-xl font-semibold mb-2">Datos del Cliente</h2>

        <div>
          <label className="block font-medium">Nombre</label>
          <input
            type="text"
            value={cliente.nombre}
            onChange={(e) =>
              setCliente({ ...cliente, nombre: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Teléfono</label>
          <input
            type="text"
            value={cliente.telefono}
            onChange={(e) =>
              setCliente({ ...cliente, telefono: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            value={cliente.email}
            onChange={(e) =>
              setCliente({ ...cliente, email: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Registrar Venta
        </button>
      </form>
    </div>
  );
}
