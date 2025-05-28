'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductoFormValues, productoSchema } from '../../lib/validations/productoSchema';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { FieldError } from 'react-hook-form';

interface ProductoFormProps {
  initialData?: any;
  onSubmit: (values: ProductoFormValues) => void;
  isSubmitting: boolean;
}

const categorias = ['Camisetas', 'Pantalones', 'Vestidos', 'Abrigos', 'Accesorios'];
const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colores = ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Gris'];

// ✅ Helper para limpiar el tipo de error
function getFieldError(error: any): FieldError | undefined {
  return error && typeof error === 'object' && 'message' in error ? (error as FieldError) : undefined;
}

export const ProductoForm = ({ initialData, onSubmit, isSubmitting }: ProductoFormProps) => {
  const [codigoGenerado, setCodigoGenerado] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: initialData || {
      precio: 0,
      costo: 0,
      variantes: [{ color: '', talla: '', stock: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variantes',
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
            error={getFieldError(errors.codigo_barra)}
            required
          />
          <Button type="button" onClick={generarCodigo} className="mt-2" variant="outline">
            Generar Código
          </Button>
          {codigoGenerado && (
            <p className="text-sm text-gray-500 mt-1">
              Código generado: <strong>{codigoGenerado}</strong>
            </p>
          )}
        </div>

        <Input label="Nombre" id="nombre" register={register} error={getFieldError(errors.nombre)} required />
        <Input label="Precio" id="precio" type="number" step="0.01" register={register} error={getFieldError(errors.precio)} required />
        <Input label="Costo" id="costo" type="number" step="0.01" register={register} error={getFieldError(errors.costo)} required />
        <Select label="Categoría" id="categoria" options={categorias} register={register} error={getFieldError(errors.categoria)} />
      </div>

      <div>
        <label className="block font-semibold text-gray-700">Variantes</label>
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded p-4 mb-2 space-y-2">
            <Select
              label="Color"
              id={`variantes.${index}.color`}
              options={colores}
              register={register}
              error={(errors.variantes as any)?.[index]?.color}
            />
            <Select
              label="Talla"
              id={`variantes.${index}.talla`}
              options={tallas}
              register={register}
              error={(errors.variantes as any)?.[index]?.talla}
            />
            <Input
              label="Stock"
              id={`variantes.${index}.stock`}
              type="number"
              register={register}
              error={(errors.variantes as any)?.[index]?.stock}
              required
            />

            <Button type="button" variant="destructive" onClick={() => remove(index)} className="mt-1">
              Eliminar Variante
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ color: '', talla: '', stock: 0 })}>
          Agregar Variante
        </Button>
      </div>

      <Input label="Descripción" id="descripcion" register={register} error={getFieldError(errors.descripcion)} multiline />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  );
};
