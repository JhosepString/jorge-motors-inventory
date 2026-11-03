import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.ts';
import { eventos } from '../../events/bus.ts';
import { cualquierRol, soloAdministrador } from '../../middlewares/permitir.ts';
import { consulta, cuerpo, validar } from '../../middlewares/validar.ts';
import { fechaOpcional, textoOpcional } from '../../utils/esquemas.ts';
import { usuarioDe } from '../../utils/peticion.ts';
import { auditar } from '../auditoria/auditoria.service.ts';
import { InventarioFacade } from '../inventario/inventario.facade.ts';
import type { MovimientoCompleto } from '../inventario/inventario.facade.ts';

const inventario = new InventarioFacade(prisma, eventos);

const movimiento = z.object({
  productoId: z.number().int().positive('Elige un producto'),
  cantidad: z.number().int('La cantidad debe ser un número entero').positive('La cantidad debe ser mayor que cero'),
  referencia: textoOpcional(50).transform((v) => v?.toUpperCase() ?? null),
  motivo: textoOpcional(200),
});
type DatosMov = z.infer<typeof movimiento>;

const salida = movimiento.refine((m) => !!m.referencia, { path: ['referencia'], message: 'Ingresa la orden de trabajo' });

const filtro = z.object({
  productoId: z.coerce.number().int().positive().optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  tipo: z.enum(['ENTRADA', 'SALIDA']).optional(),
  desde: fechaOpcional,
  hasta: fechaOpcional,
  limite: z.coerce.number().int().min(1).max(500).default(100),
});
type Filtro = z.infer<typeof filtro>;

export function aMovimiento(m: MovimientoCompleto) {
  return {
    id: m.id,
    fecha: m.fecha.toISOString(),
    productoId: m.productoId,
    sku: m.producto.sku,
    producto: m.producto.nombre,
    tipo: m.tipo,
    cantidad: m.cantidad,
    stockAnterior: m.stockAnterior,
    stockResultante: m.stockResultante,
    motivo: m.motivo,
    referencia: m.referencia,
    usuarioId: m.usuarioId,
    registradoPor: `${m.usuario.nombres} ${m.usuario.apellidos}`,
  };
}

async function listar(f: Filtro) {
  const filas = await prisma.movimiento.findMany({
    where: {
      productoId: f.productoId,
      usuarioId: f.usuarioId,
      tipo: f.tipo,
      fecha: f.desde || f.hasta ? { gte: f.desde, lt: f.hasta } : undefined,
    },
    include: {
      producto: { select: { sku: true, nombre: true, stockMinimo: true } },
      usuario: { select: { nombres: true, apellidos: true } },
    },
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    take: f.limite,
  });
  return filas.map(aMovimiento);
}

export const rutasMovimientos = Router();

rutasMovimientos.post('/salida', cualquierRol, validar({ body: salida }), async (req, res) => {
  const m = await inventario.registrarSalida(cuerpo<DatosMov>(req), usuarioDe(req));
  auditar(req, {
    accion: 'REGISTRAR_SALIDA', entidad: 'MOVIMIENTO', entidadId: m.id,
    descripcion: `Salida de ${m.cantidad} unidad(es) de ${m.producto.sku}${m.referencia ? ` (${m.referencia})` : ''}`,
    valorNuevo: { stock_anterior: m.stockAnterior, stock_resultante: m.stockResultante },
  });
  res.status(201).json({
    movimiento: aMovimiento(m),
    stockResultante: m.stockResultante,
    bajoMinimo: m.stockResultante < m.producto.stockMinimo,
  });
});

rutasMovimientos.post('/entrada', soloAdministrador, validar({ body: movimiento }), async (req, res) => {
  const m = await inventario.registrarEntrada(cuerpo<DatosMov>(req), usuarioDe(req));
  auditar(req, {
    accion: 'REGISTRAR_ENTRADA', entidad: 'MOVIMIENTO', entidadId: m.id,
    descripcion: `Entrada de ${m.cantidad} unidad(es) de ${m.producto.sku}${m.referencia ? ` (${m.referencia})` : ''}`,
    valorNuevo: { stock_anterior: m.stockAnterior, stock_resultante: m.stockResultante },
  });
  res.status(201).json({
    movimiento: aMovimiento(m),
    stockResultante: m.stockResultante,
    bajoMinimo: m.stockResultante < m.producto.stockMinimo,
  });
});

rutasMovimientos.get('/', soloAdministrador, validar({ query: filtro }), async (req, res) => {
  res.json(await listar(consulta<Filtro>(req)));
});

rutasMovimientos.get('/mios', cualquierRol, validar({ query: filtro }), async (req, res) => {
  const f = consulta<Filtro>(req);
  res.json(await listar({ ...f, usuarioId: usuarioDe(req).id, tipo: f.tipo ?? 'SALIDA' }));
});
