import { z } from 'zod';

// Funcion helper para validar numeros que pueden venir como strings
const numberLike = z.union([
    z.number(),
    z.string().transform((val, ctx) => {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Debe ser uun numero',
            });
            return z.NEVER;
        }
        return parsed;
    })
]).pipe(z.number().min(0));

export const productoSchema = z.object({
    codigo_barra: z.string().min(3, 'Codigo de barras requerido'),
    nombre: z.string().min(3, 'Nombre debe tener al menos 3 aracteres'),
    descripcion: z.string().optional(),
    precio: z.number().min(0, 'Precio no puede ser negativo'),
    costo: z.number().min(0, 'Costo no puede ser negativo'),
    categoria: z.string().optional(),
    talla: z.string().optional(),
    color: z.string().optional(),
    stock: z.number().min(0, 'Stock no puede ser negativo')
});

export type ProductoFormValues = z.infer<typeof productoSchema>;