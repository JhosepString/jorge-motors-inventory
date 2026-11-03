import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.ts';
import { eventos } from '../../events/bus.ts';
import { autenticar, firmarToken } from '../../middlewares/autenticar.ts';
import { cuerpo, validar } from '../../middlewares/validar.ts';
import type { Rol } from '../../types/sesion.ts';
import { HttpError, noAutenticado } from '../../utils/errores.ts';
import { ipDe, usuarioDe } from '../../utils/peticion.ts';
import { auditar } from '../auditoria/auditoria.service.ts';

const credenciales = z.object({
  email: z.string().trim().toLowerCase().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
type Credenciales = z.infer<typeof credenciales>;

const publico = (u: { id: number; nombres: string; apellidos: string; email: string; rol: string }) => ({
  id: u.id, nombres: u.nombres, apellidos: u.apellidos, email: u.email, rol: u.rol as Rol,
});

export const rutasAuth = Router();

rutasAuth.post('/login', validar({ body: credenciales }), async (req, res) => {
  const { email, password } = cuerpo<Credenciales>(req);
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const valida = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;

  if (!usuario || !valida) {
    eventos.publicar('ACCION_REGISTRADA', {
      usuarioId: null, rol: null, accion: 'LOGIN_FALLIDO', entidad: 'SESION',
      descripcion: `Intento de inicio de sesión fallido con el correo ${email}`, ip: ipDe(req),
    });
    throw noAutenticado('Correo o contraseña incorrectos.');
  }
  if (!usuario.activo) throw new HttpError(403, 'Tu usuario está desactivado. Habla con el administrador.');

  const rol = usuario.rol as Rol;
  req.usuario = { id: usuario.id, rol, nombre: `${usuario.nombres} ${usuario.apellidos}` };
  auditar(req, { accion: 'LOGIN', entidad: 'SESION', descripcion: 'Inicio de sesión' });
  res.json({ token: firmarToken(usuario.id, rol), usuario: publico(usuario) });
});

rutasAuth.get('/me', autenticar, async (req, res) => {
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioDe(req).id } });
  res.json(publico(usuario));
});

rutasAuth.post('/logout', autenticar, (req, res) => {
  auditar(req, { accion: 'LOGOUT', entidad: 'SESION', descripcion: 'Cierre de sesión' });
  res.status(204).end();
});
