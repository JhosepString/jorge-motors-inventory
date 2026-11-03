import { Router } from 'express';
import { prisma } from '../../db/prisma.ts';
import { soloAdministrador } from '../../middlewares/permitir.ts';
import { aMovimiento } from '../movimientos/movimientos.rutas.ts';
import { inventarioValorizado } from '../reportes/reportes.rutas.ts';

export const rutasPanel = Router();

rutasPanel.get('/resumen', soloAdministrador, async (_req, res) => {
  const [inventario, alertas, movimientos] = await Promise.all([
    inventarioValorizado(),
    prisma.alertaStock.findMany({
      where: { estado: { in: ['PENDIENTE', 'ENVIADA'] } },
      include: {
        producto: { select: { sku: true, nombre: true } },
        proveedor: { select: { razonSocial: true } },
      },
      orderBy: { fechaGenerada: 'desc' },
    }),
    prisma.movimiento.findMany({
      include: {
        producto: { select: { sku: true, nombre: true, stockMinimo: true } },
        usuario: { select: { nombres: true, apellidos: true } },
      },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      take: 6,
    }),
  ]);

  res.json({
    productosActivos: inventario.totalProductos,
    unidades: inventario.totalUnidades,
    bajoMinimo: inventario.productos.filter((p) => p.cantidadActual < p.stockMinimo).length,
    valorInventario: inventario.totalValor,
    unidadesPorCategoria: inventario.categorias.map((c) => ({ categoria: c.categoria, unidades: c.unidades })),
    alertasAbiertas: alertas.map((a) => ({
      id: a.id, sku: a.producto.sku, producto: a.producto.nombre, estado: a.estado,
      stockDetectado: a.stockDetectado, stockMinimo: a.stockMinimo,
      proveedor: a.proveedor?.razonSocial ?? null, fechaGenerada: a.fechaGenerada.toISOString(),
    })),
    ultimosMovimientos: movimientos.map(aMovimiento),
  });
});
