import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.ts';
import { soloAdministrador } from '../../middlewares/permitir.ts';
import { cuerpo, parametros, validar } from '../../middlewares/validar.ts';
import { ROLES } from '../../types/sesion.ts';
import { estadoActivo, idParam, textoRequerido } from '../../utils/esquemas.ts';
import type { EstadoActivo, IdParam } from '../../utils/esquemas.ts';
import { conflicto, noEncontrado } from '../../utils/errores.ts';
import { usuarioDe } from '../../utils/peticion.ts';
import { auditar } from '../auditoria/auditoria.service.ts';

const password = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72);
const rol = z.enum(ROLES as [string, ...string[]]);

const datosUsuario = z.object({
  nombres: textoRequerido(100),
  apellidos: textoRequerido(100),
  email: z.string().trim().toLowerCase().email('Correo inválido').max(150),
  rol,
});
const nuevoUsuario = datosUsuario.extend({ password });
type DatosUsuario = z.infer<typeof datosUsuario>;
type NuevoUsuario = z.infer<typeof nuevoUsuario>;

async function conResumen(id: number) {
  const u = await prisma.usuario.findUnique({
    where: { id },
    include: { _count: { select: { movimientos: true } } },
  });
  if (!u) throw noEncontrado('El usuario no existe.');
  const ultimo = await prisma.auditoria.findFirst({
    where: { usuarioId: id, accion: 'LOGIN' },
    orderBy: { fecha: 'desc' },
    select: { fecha: true },
  });
  return {
    id: u.id, nombres: u.nombres, apellidos: u.apellidos, email: u.email, rol: u.rol, activo: u.activo,
    movimientos: u._count.movimientos,
    ultimoIngreso: ultimo?.fecha.toISOString() ?? null,
    creadoEn: u.creadoEn.toISOString(),
  };
}

export const rutasUsuarios = Router();
rutasUsuarios.use(soloAdministrador);

rutasUsuarios.get('/', async (_req, res) => {
  const ids = await prisma.usuario.findMany({ select: { id: true }, orderBy: [{ rol: 'asc' }, { nombres: 'asc' }] });
  res.json(await Promise.all(ids.map((u) => conResumen(u.id))));
});

rutasUsuarios.post('/', validar({ body: nuevoUsuario }), async (req, res) => {
  const { password: clave, ...datos } = cuerpo<NuevoUsuario>(req);
  const creado = await prisma.usuario.create({ data: { ...datos, passwordHash: await bcrypt.hash(clave, 10) } });
  auditar(req, {
    accion: 'CREAR', entidad: 'USUARIO', entidadId: creado.id,
    descripcion: `Alta del usuario ${creado.nombres} ${creado.apellidos}`, valorNuevo: { email: creado.email, rol: creado.rol },
  });
  res.status(201).json(await conResumen(creado.id));
});

rutasUsuarios.put('/:id', validar({ params: idParam, body: datosUsuario }), async (req, res) => {
  const { id } = parametros<IdParam>(req);
  const datos = cuerpo<DatosUsuario>(req);
  if (id === usuarioDe(req).id && datos.rol !== 'ADMINISTRADOR') throw conflicto('No puedes quitarte tu propio rol de administrador.');
  const antes = await conResumen(id);
  await prisma.usuario.update({ where: { id }, data: datos });
  const despues = await conResumen(id);
  auditar(req, {
    accion: 'EDITAR', entidad: 'USUARIO', entidadId: id,
    descripcion: `Edición del usuario ${despues.nombres} ${despues.apellidos}`,
    valorAnterior: { email: antes.email, rol: antes.rol }, valorNuevo: { email: despues.email, rol: despues.rol },
  });
  res.json(despues);
});

rutasUsuarios.patch('/:id/estado', validar({ params: idParam, body: estadoActivo }), async (req, res) => {
  const { id } = parametros<IdParam>(req);
  const { activo } = cuerpo<EstadoActivo>(req);
  if (id === usuarioDe(req).id && !activo) throw conflicto('No puedes desactivar tu propio usuario.');
  await conResumen(id);
  await prisma.usuario.update({ where: { id }, data: { activo } });
  const u = await conResumen(id);
  auditar(req, {
    accion: activo ? 'ACTIVAR' : 'DESACTIVAR', entidad: 'USUARIO', entidadId: id,
    descripcion: `${activo ? 'Activación' : 'Desactivación'} del usuario ${u.nombres} ${u.apellidos}`,
  });
  res.json(u);
});

rutasUsuarios.patch('/:id/password', validar({ params: idParam, body: z.object({ password }) }), async (req, res) => {
  const { id } = parametros<IdParam>(req);
  const u = await conResumen(id);
  await prisma.usuario.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(cuerpo<{ password: string }>(req).password, 10) },
  });
  auditar(req, {
    accion: 'EDITAR', entidad: 'USUARIO', entidadId: id,
    descripcion: `Cambio de contraseña del usuario ${u.nombres} ${u.apellidos}`,
  });
  res.status(204).end();
});
