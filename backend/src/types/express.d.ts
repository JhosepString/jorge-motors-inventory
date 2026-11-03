import type { UsuarioSesion } from './sesion.ts';

declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado (lo agrega el filtro JWT) */
      usuario?: UsuarioSesion;
      /** Datos ya validados por Zod (lo agrega el filtro de validación) */
      validado?: { body?: unknown; query?: unknown; params?: unknown };
    }
  }
}

export {};
