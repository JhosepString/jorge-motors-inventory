import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.ts';
import { cualquierRol, soloAdministrador } from '../../middlewares/permitir.ts';
import { consulta, cuerpo, parametros, validar } from '../../middlewares/validar.ts';
import {
  booleanoTexto, estadoActivo, idParam, textoOpcional, textoRequerido,
} from '../../utils/esquemas.ts';
import type { EstadoActivo, IdParam } from '../../utils/esquemas.ts';
import { usuarioDe } from '../../utils/peticion.ts';
import { auditar } from '../auditoria/auditoria.service.ts';
import {
  cambiarEstadoProducto, crearProducto, editarProducto, listarProductos, obtenerProducto,
} from './productos.service.ts';
import type { DatosProducto } from './productos.service.ts';

const UNIDADES = ['UNIDAD', 'LITRO', 'GALON', 'JUEGO', 'KIT', 'METRO', 'CAJA'] as const;

const filtro = z.object({
  buscar: z.string().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  soloBajoMinimo: booleanoTexto,
  incluirInactivos: booleanoTexto,
});

const producto = z.object({
  sku: textoRequerido(20).transform((v) => v.toUpperCase()),
  nombre: textoRequerido(150),
  descripcion: textoOpcional(500),
  marca: textoOpcional(80),
  unidadMedida: z.enum(UNIDADES),
  precioCompra: z.number().min(0, 'No puede ser negativo'),
  precioVenta: z.number().min(0, 'No puede ser negativo'),
  stockMinimo: z.number().int().min(0, 'No puede ser negativo'),
  categoriaId: z.number().int().positive('Elige una categoría'),
  proveedorId: z.number().int().positive().nullable(),
  ubicacion: textoOpcional(20),
});

const categoria = z.object({
  nombre: textoRequerido(80),
  descripcion: textoOpcional(255),
});
type DatosCategoria = z.infer<typeof categoria>;

export const rutasProductos = Router();

rutasProductos.get('/', cualquierRol, validar({ query: filtro }), async (req, res) => {
  const conPrecios = usuarioDe(req).rol === 'ADMINISTRADOR';
  res.json(await listarProductos(consulta<z.infer<typeof filtro>>(req), conPrecios));
});

rutasProductos.get('/:id', cualquierRol, validar({ params: idParam }), async (req, res) => {
  const conPrecios = usuarioDe(req).rol === 'ADMINISTRADOR';
  res.json(await obtenerProducto(parametros<IdParam>(req).id, conPrecios));
});

rutasProductos.post('/', soloAdministrador, validar({ body: producto }), async (req, res) => {
  const creado = await crearProducto(cuerpo<DatosProducto>(req));
  auditar(req, {
    accion: 'CREAR', entidad: 'PRODUCTO', entidadId: creado.id,
    descripcion: `Registro del producto ${creado.sku} · ${creado.nombre}`, valorNuevo: creado,
  });
  res.status(201).json(creado);
});

rutasProductos.put('/:id', soloAdministrador, validar({ params: idParam, body: producto }), async (req, res) => {
  const { antes, despues } = await editarProducto(parametros<IdParam>(req).id, cuerpo<DatosProducto>(req));
  auditar(req, {
    accion: 'EDITAR', entidad: 'PRODUCTO', entidadId: despues.id,
    descripcion: `Edición del producto ${despues.sku}`, valorAnterior: antes, valorNuevo: despues,
  });
  res.json(despues);
});

rutasProductos.patch('/:id/estado', soloAdministrador, validar({ params: idParam, body: estadoActivo }), async (req, res) => {
  const { activo } = cuerpo<EstadoActivo>(req);
  const p = await cambiarEstadoProducto(parametros<IdParam>(req).id, activo);
  auditar(req, {
    accion: activo ? 'ACTIVAR' : 'DESACTIVAR', entidad: 'PRODUCTO', entidadId: p.id,
    descripcion: `${activo ? 'Activación' : 'Desactivación'} del producto ${p.sku}`,
  });
  res.json(p);
});

export const rutasCategorias = Router();

rutasCategorias.get('/', cualquierRol, async (_req, res) => {
  const filas = await prisma.categoria.findMany({
    where: { activo: true },
    orderBy: { id: 'asc' },
    include: { _count: { select: { productos: true } } },
  });
  res.json(filas.map((c) => ({ id: c.id, nombre: c.nombre, descripcion: c.descripcion, productos: c._count.productos })));
});

rutasCategorias.post('/', soloAdministrador, validar({ body: categoria }), async (req, res) => {
  const c = await prisma.categoria.create({ data: cuerpo<DatosCategoria>(req) });
  auditar(req, { accion: 'CREAR', entidad: 'CATEGORIA', entidadId: c.id, descripcion: `Registro de la categoría ${c.nombre}`, valorNuevo: c });
  res.status(201).json({ id: c.id, nombre: c.nombre, descripcion: c.descripcion, productos: 0 });
});

rutasCategorias.put('/:id', soloAdministrador, validar({ params: idParam, body: categoria }), async (req, res) => {
  const { id } = parametros<IdParam>(req);
  const antes = await prisma.categoria.findUniqueOrThrow({ where: { id } });
  const c = await prisma.categoria.update({ where: { id }, data: cuerpo<DatosCategoria>(req) });
  auditar(req, { accion: 'EDITAR', entidad: 'CATEGORIA', entidadId: id, descripcion: `Edición de la categoría ${c.nombre}`, valorAnterior: antes, valorNuevo: c });
  res.json({ id: c.id, nombre: c.nombre, descripcion: c.descripcion });
});
