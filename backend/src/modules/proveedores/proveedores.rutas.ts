import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.ts';
import { soloAdministrador } from '../../middlewares/permitir.ts';
import { consulta, cuerpo, parametros, validar } from '../../middlewares/validar.ts';
import { booleanoTexto, estadoActivo, idParam, textoOpcional, textoRequerido } from '../../utils/esquemas.ts';
import type { EstadoActivo, IdParam } from '../../utils/esquemas.ts';
import { noEncontrado } from '../../utils/errores.ts';
import { auditar } from '../auditoria/auditoria.service.ts';

// Strategy: el canal decide qué dato es obligatorio (la base aplica la misma regla con un CHECK)
const proveedor = z
  .object({
    ruc: z.string().trim().regex(/^\d{11}$/, 'El RUC debe tener 11 dígitos'),
    razonSocial: textoRequerido(150),
    contacto: textoOpcional(120),
    telefono: textoOpcional(20),
    email: textoOpcional(150).refine((v) => !v || z.email().safeParse(v).success, 'Correo inválido'),
    direccion: textoOpcional(200),
    ciudad: textoOpcional(80),
    canalPreferido: z.enum(['CORREO', 'SMS', 'WHATSAPP']),
  })
  .superRefine((p, ctx) => {
    if (p.canalPreferido === 'CORREO' && !p.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'Con el canal CORREO el correo es obligatorio' });
    }
    if (p.canalPreferido !== 'CORREO' && !p.telefono) {
      ctx.addIssue({ code: 'custom', path: ['telefono'], message: `Con el canal ${p.canalPreferido} el teléfono es obligatorio` });
    }
  });
type DatosProveedor = z.infer<typeof proveedor>;

async function conConteo(id: number) {
  const p = await prisma.proveedor.findUnique({
    where: { id },
    include: { _count: { select: { productos: true } } },
  });
  if (!p) throw noEncontrado('El proveedor no existe.');
  const { _count, ...resto } = p;
  return { ...resto, creadoEn: p.creadoEn.toISOString(), productos: _count.productos };
}

export const rutasProveedores = Router();

rutasProveedores.get('/', soloAdministrador, validar({ query: z.object({ incluirInactivos: booleanoTexto }) }), async (req, res) => {
  const { incluirInactivos } = consulta<{ incluirInactivos: boolean }>(req);
  const filas = await prisma.proveedor.findMany({
    where: incluirInactivos ? undefined : { activo: true },
    include: { _count: { select: { productos: true } } },
    orderBy: { razonSocial: 'asc' },
  });
  res.json(filas.map(({ _count, ...p }) => ({ ...p, creadoEn: p.creadoEn.toISOString(), productos: _count.productos })));
});

rutasProveedores.post('/', soloAdministrador, validar({ body: proveedor }), async (req, res) => {
  const creado = await prisma.proveedor.create({ data: cuerpo<DatosProveedor>(req) });
  auditar(req, {
    accion: 'CREAR', entidad: 'PROVEEDOR', entidadId: creado.id,
    descripcion: `Registro del proveedor ${creado.razonSocial}`, valorNuevo: { ruc: creado.ruc, canalPreferido: creado.canalPreferido },
  });
  res.status(201).json(await conConteo(creado.id));
});

rutasProveedores.put('/:id', soloAdministrador, validar({ params: idParam, body: proveedor }), async (req, res) => {
  const { id } = parametros<IdParam>(req);
  const antes = await conConteo(id);
  await prisma.proveedor.update({ where: { id }, data: cuerpo<DatosProveedor>(req) });
  const despues = await conConteo(id);
  auditar(req, {
    accion: 'EDITAR', entidad: 'PROVEEDOR', entidadId: id,
    descripcion: `Edición del proveedor ${despues.razonSocial}`, valorAnterior: antes, valorNuevo: despues,
  });
  res.json(despues);
});

rutasProveedores.patch('/:id/estado', soloAdministrador, validar({ params: idParam, body: estadoActivo }), async (req, res) => {
  const { id } = parametros<IdParam>(req);
  const { activo } = cuerpo<EstadoActivo>(req);
  await conConteo(id);
  await prisma.proveedor.update({ where: { id }, data: { activo } });
  const p = await conConteo(id);
  auditar(req, {
    accion: activo ? 'ACTIVAR' : 'DESACTIVAR', entidad: 'PROVEEDOR', entidadId: id,
    descripcion: `${activo ? 'Activación' : 'Desactivación'} del proveedor ${p.razonSocial}`,
  });
  res.json(p);
});
