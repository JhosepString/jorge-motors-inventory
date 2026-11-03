// Eslabón 1 de la cadena: verifica el token JWT y que el usuario siga activo
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.ts';
import { prisma } from '../db/prisma.ts';
import type { Rol } from '../types/sesion.ts';
import { noAutenticado } from '../utils/errores.ts';

interface ContenidoToken {
  sub: string;
  rol: Rol;
}

export function firmarToken(usuarioId: number, rol: Rol): string {
  return jwt.sign({ rol }, config.JWT_SECRET, {
    subject: String(usuarioId),
    expiresIn: config.JWT_EXPIRA as jwt.SignOptions['expiresIn'],
  });
}

export async function autenticar(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const cabecera = req.headers.authorization ?? '';
  const [tipo, token] = cabecera.split(' ');
  if (tipo !== 'Bearer' || !token) throw noAutenticado();

  let contenido: ContenidoToken;
  try {
    contenido = jwt.verify(token, config.JWT_SECRET) as ContenidoToken;
  } catch {
    throw noAutenticado('Tu sesión expiró. Vuelve a iniciar sesión.');
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(contenido.sub) } });
  if (!usuario || !usuario.activo) throw noAutenticado('Tu usuario ya no tiene acceso. Habla con el administrador.');

  req.usuario = { id: usuario.id, rol: usuario.rol as Rol, nombre: `${usuario.nombres} ${usuario.apellidos}` };
  next();
}
