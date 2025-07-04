import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  context: { params?: { id?: string } }
) {
  const idStr = context.params?.id;
  const id = idStr ? parseInt(idStr) : NaN;

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  // Simulamos una respuesta parecida a la real, pero sin usar DB
  const fakeCliente = {
    nombre: `Cliente #${id}`,
    ventas: [
      {
        id: 1,
        cantidad: 2,
        fecha: new Date().toISOString(),
        variante: {
          producto: {
            nombre: 'Producto de prueba',
            precio: 1500,
          },
        },
      },
    ],
  };

  return NextResponse.json(fakeCliente);
}
