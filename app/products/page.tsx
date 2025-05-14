import { PrismaClient } from '@prisma/client';
import { ProductsTable } from '@/app/components/productos/ProductsTable';

const prisma = new PrismaClient();

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 10;

  const productos = await prisma.producto.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      fecha_creacion: 'desc',
    },
  });

  const total = await prisma.producto.count();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <a 
          href="/products/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Añadir Producto
        </a>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ProductsTable 
          productos={productos} 
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
        />
      </div>
    </div>
  );
}