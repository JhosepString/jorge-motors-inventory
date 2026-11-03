// Eslabón 2 de la cadena: comprueba que el rol tenga permiso para la acción
import type { NextFunction, Request, Response } from 'express';
import type { Rol } from '../types/sesion.ts';
import { noAutenticado, prohibido } from '../utils/errores.ts';

export function permitir(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) throw noAutenticado();
    if (!roles.includes(req.usuario.rol)) throw prohibido();
    next();
  };
}

export const soloAdministrador = permitir('ADMINISTRADOR');
export const cualquierRol = permitir('ADMINISTRADOR', 'AUXILIAR_INVENTARIO');
