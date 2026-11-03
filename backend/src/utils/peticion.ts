import type { Request } from 'express';
import type { UsuarioSesion } from '../types/sesion.ts';
import { noAutenticado } from './errores.ts';

/** Usuario de la sesión (siempre existe después del filtro JWT) */
export function usuarioDe(req: Request): UsuarioSesion {
  if (!req.usuario) throw noAutenticado();
  return req.usuario;
}

export function ipDe(req: Request): string | null {
  return req.ip ?? null;
}

/** Convierte Decimal o BigInt de Prisma a number para el JSON */
export const num = (valor: unknown): number => Number(valor);
