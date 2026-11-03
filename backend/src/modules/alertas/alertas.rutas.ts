import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.ts';
import { eventos } from '../../events/bus.ts';
import { soloAdministrador } from '../../middlewares/permitir.ts';
import { consulta, parametros, validar } from '../../middlewares/validar.ts';
import { idParam } from '../../utils/esquemas.ts';
import type { IdParam } from '../../utils/esquemas.ts';
import { ipDe, usuarioDe } from '../../utils/peticion.ts';
import { bandejaSalida } from './canales.ts';
import { estadoDe } from './estados.ts';
import { NotificadorStock } from './notificador-stock.ts';

export const notificador = new NotificadorStock(prisma, eventos);

async function alertaCompleta(id: number) {
  const a = await prisma.alertaStock.findUniqueOrThrow({
    where: { id },
    include: {
      producto: { select: { sku: true, nombre: true, stock: { select: { cantidadActual: true } } } },
      proveedor: { select: { razonSocial: true, canalPreferido: true } },
    },
  });
  return {
    id: a.id,
    productoId: a.productoId,
    sku: a.producto.sku,
    producto: a.producto.nombre,
    stockActual: a.producto.stock?.cantidadActual ?? 0,
    stockDetectado: a.stockDetectado,
    stockMinimo: a.stockMinimo,
    proveedorId: a.proveedorId,
    proveedor: a.proveedor?.razonSocial ?? null,
    canalPreferido: a.proveedor?.canalPreferido ?? null,
    estado: a.estado,
    canal: a.canal,
    acciones: estadoDe(a.estado).acciones,
    fechaGenerada: a.fechaGenerada.toISOString(),
    fechaEnviada: a.fechaEnviada?.toISOString() ?? null,
    fechaAtendida: a.fechaAtendida?.toISOString() ?? null,
  };
}

export const rutasAlertas = Router();
rutasAlertas.use(soloAdministrador);

rutasAlertas.get('/', validar({ query: z.object({ estado: z.enum(['PENDIENTE', 'ENVIADA', 'ATENDIDA']).optional() }) }), async (req, res) => {
  const { estado } = consulta<{ estado?: string }>(req);
  const ids = await prisma.alertaStock.findMany({
    where: { estado },
    select: { id: true },
    orderBy: [{ fechaGenerada: 'desc' }, { id: 'desc' }],
  });
  res.json(await Promise.all(ids.map((a) => alertaCompleta(a.id))));
});

rutasAlertas.get('/bandeja', (_req, res) => {
  res.json(bandejaSalida);
});

rutasAlertas.patch('/:id/enviar', validar({ params: idParam }), async (req, res) => {
  const u = usuarioDe(req);
  const { id } = parametros<IdParam>(req);
  await notificador.enviar(id, { usuarioId: u.id, rol: u.rol, ip: ipDe(req) });
  res.json(await alertaCompleta(id));
});

rutasAlertas.patch('/:id/atender', validar({ params: idParam }), async (req, res) => {
  const u = usuarioDe(req);
  const { id } = parametros<IdParam>(req);
  await notificador.atender(id, { usuarioId: u.id, rol: u.rol, ip: ipDe(req) });
  res.json(await alertaCompleta(id));
});
