import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.ts';
import { soloAdministrador } from '../../middlewares/permitir.ts';
import { consulta, cuerpo, validar } from '../../middlewares/validar.ts';
import { noEncontrado } from '../../utils/errores.ts';
import { num } from '../../utils/peticion.ts';
import { auditar } from '../auditoria/auditoria.service.ts';
import { listarProductos } from '../productos/productos.service.ts';

const redondear = (n: number) => Math.round(n * 100) / 100;

export async function inventarioValorizado() {
  const productos = await listarProductos({ soloBajoMinimo: false, incluirInactivos: false }, true);
  const filas = productos.map((p) => ({
    ...p,
    valorInventario: redondear(p.cantidadActual * (p.precioCompra ?? 0)),
    estadoStock: p.cantidadActual === 0 ? 'AGOTADO' : p.cantidadActual < p.stockMinimo ? 'CRITICO' : 'NORMAL',
  }));
  const porCategoria = new Map<string, { categoria: string; productos: number; unidades: number; valor: number }>();
  for (const p of filas) {
    const c = porCategoria.get(p.categoria) ?? { categoria: p.categoria, productos: 0, unidades: 0, valor: 0 };
    c.productos += 1;
    c.unidades += p.cantidadActual;
    c.valor = redondear(c.valor + p.valorInventario);
    porCategoria.set(p.categoria, c);
  }
  return {
    generado: new Date().toISOString(),
    totalProductos: filas.length,
    totalUnidades: filas.reduce((s, p) => s + p.cantidadActual, 0),
    totalValor: redondear(filas.reduce((s, p) => s + p.valorInventario, 0)),
    categorias: [...porCategoria.values()].sort((a, b) => b.valor - a.valor),
    productos: filas,
  };
}

export async function kardex(productoId: number) {
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    include: { stock: true, categoria: { select: { nombre: true } } },
  });
  if (!producto) throw noEncontrado('El producto no existe.');
  const movimientos = await prisma.movimiento.findMany({
    where: { productoId },
    include: { usuario: { select: { nombres: true, apellidos: true } } },
    orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
  });
  return {
    producto: {
      id: producto.id, sku: producto.sku, nombre: producto.nombre, categoria: producto.categoria.nombre,
      stockActual: producto.stock?.cantidadActual ?? 0, stockMinimo: producto.stockMinimo,
      precioCompra: num(producto.precioCompra),
    },
    movimientos: movimientos.map((m) => ({
      id: m.id,
      fecha: m.fecha.toISOString(),
      tipo: m.tipo,
      referencia: m.referencia,
      motivo: m.motivo,
      entrada: m.tipo === 'ENTRADA' ? m.cantidad : 0,
      salida: m.tipo === 'SALIDA' ? m.cantidad : 0,
      saldo: m.stockResultante,
      registradoPor: `${m.usuario.nombres} ${m.usuario.apellidos}`,
    })),
  };
}

/** CSV con separador ";" y BOM, para que Excel en español lo abra con tildes y columnas correctas */
function enviarCsv(res: Response, nombre: string, cabecera: string[], filas: (string | number | null)[][]) {
  const celda = (v: string | number | null) => {
    const t = v === null ? '' : String(v);
    return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const contenido = [cabecera, ...filas].map((f) => f.map(celda).join(';')).join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
  res.send('﻿' + contenido);
}

const kardexQuery = z.object({ productoId: z.coerce.number().int().positive('Elige un producto') });
type KardexQuery = z.infer<typeof kardexQuery>;

export const rutasReportes = Router();
rutasReportes.use(soloAdministrador);

rutasReportes.get('/inventario', async (_req, res) => {
  res.json(await inventarioValorizado());
});

rutasReportes.get('/kardex', validar({ query: kardexQuery }), async (req, res) => {
  res.json(await kardex(consulta<KardexQuery>(req).productoId));
});

rutasReportes.get('/inventario.csv', async (req, res) => {
  const r = await inventarioValorizado();
  auditar(req, { accion: 'EXPORTAR_REPORTE', entidad: 'REPORTE', descripcion: 'Exportación del inventario valorizado a Excel (CSV)' });
  enviarCsv(res, 'inventario-valorizado.csv',
    ['SKU', 'Producto', 'Categoría', 'Ubicación', 'Stock', 'Mínimo', 'Precio compra', 'Valor', 'Estado'],
    r.productos.map((p) => [p.sku, p.nombre, p.categoria, p.ubicacion, p.cantidadActual, p.stockMinimo,
      (p.precioCompra ?? 0).toFixed(2), p.valorInventario.toFixed(2), p.estadoStock]));
});

rutasReportes.get('/kardex.csv', validar({ query: kardexQuery }), async (req, res) => {
  const k = await kardex(consulta<KardexQuery>(req).productoId);
  auditar(req, {
    accion: 'EXPORTAR_REPORTE', entidad: 'REPORTE', entidadId: k.producto.id,
    descripcion: `Exportación del kardex de ${k.producto.sku} a Excel (CSV)`,
  });
  enviarCsv(res, `kardex-${k.producto.sku}.csv`,
    ['Fecha (UTC)', 'Tipo', 'Documento', 'Motivo', 'Entrada', 'Salida', 'Saldo', 'Registrado por'],
    k.movimientos.map((m) => [m.fecha, m.tipo, m.referencia, m.motivo, m.entrada, m.salida, m.saldo, m.registradoPor]));
});

/** El frontend avisa cuando imprime un reporte en PDF, para que quede en auditoría */
rutasReportes.post('/exportado', validar({
  body: z.object({ reporte: z.enum(['inventario', 'kardex']), productoId: z.number().int().positive().optional() }),
}), async (req, res) => {
  const { reporte, productoId } = cuerpo<{ reporte: 'inventario' | 'kardex'; productoId?: number }>(req);
  const sku = productoId ? (await prisma.producto.findUnique({ where: { id: productoId } }))?.sku : null;
  auditar(req, {
    accion: 'EXPORTAR_REPORTE', entidad: 'REPORTE', entidadId: productoId ?? null,
    descripcion: reporte === 'kardex' ? `Exportación del kardex de ${sku ?? productoId} a PDF` : 'Exportación del inventario valorizado a PDF',
  });
  res.status(204).end();
});
