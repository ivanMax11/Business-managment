'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Cliente {
    nombre: string;
    email?: string;
    telefono?: string;
}

interface Producto {
    nombre: string;
    precio: number;
}

interface Venta {
    id: number;
    cantidad: number;
    fecha: string;
    producto: Producto;
    cliente: Cliente;

}

export default function SalesList() {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const perPage = 10;

    const fetchVentas = async () => {
        try {
            const params: any = {
                page,
                perPage,
            };

            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await axios.get('/api/ventas/list', { params });
            setVentas(res.data.ventas);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Error al obtener ventas', error);
        }
    };

    useEffect(() => {
        fetchVentas();
    }, [page]);

    const totalPages = Math.ceil(total / perPage);

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Listado de Ventas</h2>

            <div className="flex gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">Desde</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border px-2 py-1 rounded w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Hasta</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border px-2 py-1 rounded w-full"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={() => {
                            setPage(1);
                            fetchVentas();
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Fecha</th>
                        <th className="p-2 border">Producto</th>
                        <th className="p-2 border">Cantidad</th>
                        <th className="p-2 border">Precio</th>
                        <th className="p-2 border">Total</th>
                        <th className="p-2 border">Cliente</th>
                    </tr>
                </thead>
                <tbody>
                    {ventas.map((venta) => (
                        <tr key={venta.id}>
                            <td className="p-2 border">{new Date(venta.fecha).toLocaleDateString()}</td>
                            <td className="p-2 border">{venta.producto.nombre}</td>
                            <td className="p-2 border">{venta.cantidad}</td>
                            <td className="p-2 border">${venta.producto.precio.toFixed(2)}</td>
                            <td className="p-2 border">
                                ${(venta.producto.precio * venta.cantidad).toFixed(2)}
                            </td>
                            <td className="p-2 border">{venta.cliente.nombre}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Paginación */}
            <div className="mt-4 flex gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="self-center">
                    Página {page} de {totalPages}
                </span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
