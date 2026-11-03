import 'dotenv/config';
import { z } from 'zod';

const esquema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'Falta DATABASE_URL en el archivo .env'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRA: z.string().default('8h'),
  CORS_ORIGEN: z.string().default('http://localhost:5173'),
  ALERTAS_ENVIO_AUTOMATICO: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
});

const resultado = esquema.safeParse(process.env);
if (!resultado.success) {
  const detalle = resultado.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Configuración inválida en .env:\n${detalle}`);
}

export const config = resultado.data;
