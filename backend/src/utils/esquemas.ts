// Esquemas de Zod que se repiten en varios módulos
import { z } from 'zod';

export const idParam = z.object({ id: z.coerce.number().int().positive('id inválido') });
export type IdParam = z.infer<typeof idParam>;

export const estadoActivo = z.object({ activo: z.boolean() });
export type EstadoActivo = z.infer<typeof estadoActivo>;

const texto = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`);

export const textoRequerido = (max: number) => texto(max).min(1, 'Es obligatorio');
export const textoOpcional = (max: number) =>
  texto(max).optional().nullable().transform((v) => (v ? v : null));

export const fechaOpcional = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : undefined))
  .refine((v) => v === undefined || !Number.isNaN(v.getTime()), 'Fecha inválida');

export const booleanoTexto = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true');
