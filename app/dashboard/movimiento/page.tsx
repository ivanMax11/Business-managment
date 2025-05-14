'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function RegistrarMovimientoPage() {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [tipoMovimiento, setTipoMovimiento] = useState('ENTRADA');
  const [motivo, setMotivo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Obtener lista de productos desde el backend
    axios.get('/api/productos')
  .then((res) => {
    console.log('Productos cargados:', res.data);
    setProductos(Array.isArray(res.data) ? res.data : res.data.data);
  })
  .catch((err) => console.error('Error al cargar productos:', err));

  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/movimientos', {
        producto_id: Number(productoId),
        cantidad: Number(cantidad),
        tipo_movimiento: tipoMovimiento,
        motivo,
        usuario,
      });
      setMensaje('Movimiento registrado correctamente ✅');
      // Reiniciar formulario
      setProductoId('');
      setCantidad(0);
      setTipoMovimiento('ENTRADA');
      setMotivo('');
      setUsuario('');
    } catch (error: any) {
      setMensaje(error.response?.data?.error || 'Error al registrar movimiento ❌');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">Registrar Movimiento</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Producto</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            required
          >
            <option value="">-- Selecciona un producto --</option>
            {productos.map((producto: any) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Cantidad</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Tipo de Movimiento</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value)}
            required
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Motivo (opcional)</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Usuario</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Registrar Movimiento
        </button>
      </form>

      {mensaje && (
        <div className="text-center text-sm text-green-700 mt-4">
          {mensaje}
        </div>
      )}
    </div>
  );
}
