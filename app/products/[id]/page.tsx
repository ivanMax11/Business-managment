// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ProductDetail } from '@/app/components/productos/ProductDetail';

const prisma = new PrismaClient();

export default async function ProductPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
    // 1. Validar y convertir el ID
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return notFound();
    }

    // 2. Buscar el producto
    const producto = await prisma.producto.findUnique({
      where: { id: productId },
    });

    // 3. Si no existe, mostrar 404
    if (!producto) {
      return notFound();
    }

    // 4. Renderizar el componente
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <ProductDetail producto={producto} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    return notFound();
  }
}