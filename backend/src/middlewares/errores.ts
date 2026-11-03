// Último eslabón: cualquier error de la cadena termina aquí y se responde con un formato uniforme
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/errores.ts';

/** Mensajes que lanzan los triggers de SQL Server (schema.sql) */
const MENSAJES_DE_LA_BASE = [
  'Transición de estado de alerta no permitida',
  'Los movimientos son inmutables',
  'Los movimientos no se pueden eliminar',
  'Los registros de auditoría no se pueden',
];

function codigoPrisma(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
}

export function rutaNoEncontrada(req: Request, res: Response): void {
  res.status(404).json({ mensaje: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

export function manejarErrores(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ mensaje: error.message });
    return;
  }
  if (error instanceof ZodError) {
    const primero = error.issues[0];
    const campo = primero?.path.join('.');
    res.status(400).json({ mensaje: primero ? `${campo ? `${campo}: ` : ''}${primero.message}` : 'Datos inválidos.' });
    return;
  }
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.' });
    return;
  }

  const codigo = codigoPrisma(error);
  if (codigo === 'P2002') {
    res.status(409).json({ mensaje: 'Ya existe un registro con ese valor único (SKU, RUC, correo o nombre).' });
    return;
  }
  if (codigo === 'P2003') {
    res.status(409).json({ mensaje: 'No se puede completar: hay registros relacionados que lo impiden.' });
    return;
  }
  if (codigo === 'P2025') {
    res.status(404).json({ mensaje: 'El registro no existe.' });
    return;
  }

  const texto = error instanceof Error ? error.message : String(error);
  const deLaBase = MENSAJES_DE_LA_BASE.find((m) => texto.includes(m));
  if (deLaBase) {
    res.status(409).json({ mensaje: `${deLaBase}.` });
    return;
  }
  if (/CHECK constraint|restricción CHECK/i.test(texto)) {
    res.status(400).json({ mensaje: 'Los datos no cumplen una regla de la base de datos.' });
    return;
  }

  console.error('[error]', error);
  res.status(500).json({ mensaje: 'Ocurrió un error inesperado en el servidor.' });
}
