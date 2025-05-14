'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductoFormValues, productoSchema } from '../../lib/validations/productoSchema';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

interface ProductoFormProps {
  initialData?: any;
  onSubmit: (values: ProductoFormValues) => void;
  isSubmitting: boolean;
}

const categorias = ['Camisetas', 'Pantalones', 'Vestidos', 'Abrigos', 'Accesorios'];
const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colores = ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Gris'];

export const ProductoForm = ({ initialData, onSubmit, isSubmitting }: ProductoFormProps) => {
  const [codigoGenerado, setCodigoGenerado] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: initialData || {
      stock: 0,
      precio: 0,
      costo: 0,
    },
  });

  const generarCodigo = () => {
    const nuevoCodigo = uuidv4().slice(0, 12).replace(/-/g, '').toUpperCase();
    setValue('codigo_barra', nuevoCodigo);
    setCodigoGenerado(nuevoCodigo);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Código de Barras"
            id="codigo_barra"
            register={register}
            error={errors.codigo_barra}
            required
          />
          <Button
            type="button"
            onClick={generarCodigo}
            className="mt-2"
            variant="outline"
          >
            Generar Código
          </Button>
          {codigoGenerado && (
            <p className="text-sm text-gray-500 mt-1">
              Código generado: <strong>{codigoGenerado}</strong>
            </p>
          )}
        </div>

        <Input
          label="Nombre"
          id="nombre"
          register={register}
          error={errors.nombre}
          required
        />

        <Input
          label="Precio"
          id="precio"
          type="number"
          step="0.01"
          register={register}
          error={errors.precio}
          required
        />

        <Input
          label="Costo"
          id="costo"
          type="number"
          step="0.01"
          register={register}
          error={errors.costo}
          required
        />

        <Select
          label="Categoría"
          id="categoria"
          options={categorias}
          register={register}
          error={errors.categoria}
        />

        <Select
          label="Talla"
          id="talla"
          options={tallas}
          register={register}
          error={errors.talla}
        />

        <Select
          label="Color"
          id="color"
          options={colores}
          register={register}
          error={errors.color}
        />

        <Input
          label="Stock"
          id="stock"
          type="number"
          register={register}
          error={errors.stock}
          required
        />
      </div>

      <div>
        <Input
          label="Descripción"
          id="descripcion"
          register={register}
          error={errors.descripcion}
          multiline
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  );
};