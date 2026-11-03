// Observer + State + Strategy: reacciona a STOCK_ACTUALIZADO, crea la alerta y la envía por el canal del proveedor
import type { Prisma } from '../../db/prisma.ts';
import type { AccionRegistrada, BusEventos } from '../../events/bus.ts';
import { noEncontrado, solicitudInvalida } from '../../utils/errores.ts';
import { estrategiaPara } from './canales.ts';
import { estadoDe } from './estados.ts';

const incluirAlerta = {
  producto: { select: { sku: true, nombre: true } },
  proveedor: { select: { razonSocial: true, email: true, telefono: true, canalPreferido: true } },
} as const;

type Autor = Pick<AccionRegistrada, 'usuarioId' | 'rol' | 'ip'>;
const SISTEMA: Autor = { usuarioId: null, rol: null, ip: null };

export class NotificadorStock {
  private readonly db: Prisma;
  private readonly bus: BusEventos;

  constructor(db: Prisma, bus: BusEventos) {
    this.db = db;
    this.bus = bus;
  }

  /** Se suscribe al evento de Inventario (Inventario no conoce a esta clase) */
  suscribir(envioAutomatico: boolean): void {
    this.bus.suscribir('STOCK_ACTUALIZADO', async ({ productoId }) => {
      const alerta = await this.evaluarStockMinimo(productoId);
      if (alerta && envioAutomatico && alerta.proveedorId) {
        await this.enviar(alerta.id, SISTEMA).catch((e: unknown) =>
          console.warn(`[alertas] No se pudo enviar la alerta #${alerta.id}:`, e instanceof Error ? e.message : e));
      }
    });
  }

  /** Crea una alerta PENDIENTE si el stock quedó bajo el mínimo y no hay otra abierta */
  async evaluarStockMinimo(productoId: number) {
    const producto = await this.db.producto.findUnique({ where: { id: productoId }, include: { stock: true } });
    if (!producto?.stock || producto.stock.cantidadActual >= producto.stockMinimo) return null;

    const abierta = await this.db.alertaStock.findFirst({
      where: { productoId, estado: { in: ['PENDIENTE', 'ENVIADA'] } },
    });
    if (abierta) return null;

    try {
      return await this.db.alertaStock.create({
        data: {
          productoId,
          proveedorId: producto.proveedorId,
          stockDetectado: producto.stock.cantidadActual,
          stockMinimo: producto.stockMinimo,
        },
      });
    } catch (e: unknown) {
      // El índice único filtrado evita duplicados si dos salidas llegan a la vez
      if (typeof e === 'object' && e && 'code' in e && e.code === 'P2002') return null;
      throw e;
    }
  }

  async enviar(alertaId: number, autor: Autor) {
    const alerta = await this.db.alertaStock.findUnique({ where: { id: alertaId }, include: incluirAlerta });
    if (!alerta) throw noEncontrado('La alerta no existe.');
    if (!alerta.proveedor) throw solicitudInvalida('El producto no tiene proveedor asignado: asígnale uno antes de enviar la alerta.');

    const estrategia = estrategiaPara(alerta.proveedor.canalPreferido);
    const cambio = estadoDe(alerta.estado).enviar(estrategia.canal); // State: solo PENDIENTE puede enviarse
    const mensaje = await estrategia.enviar({
      alertaId: alerta.id,
      proveedor: alerta.proveedor,
      producto: alerta.producto,
      stockDetectado: alerta.stockDetectado,
      stockMinimo: alerta.stockMinimo,
    });

    const actualizada = await this.db.alertaStock.update({
      where: { id: alertaId },
      data: { estado: cambio.estado, canal: cambio.canal, fechaEnviada: cambio.fechaEnviada },
    });
    this.bus.publicar('ACCION_REGISTRADA', {
      ...autor,
      accion: 'ENVIAR_ALERTA',
      entidad: 'ALERTA_STOCK',
      entidadId: alertaId,
      descripcion: `Alerta de ${alerta.producto.sku} enviada por ${estrategia.canal} a ${alerta.proveedor.razonSocial}`
        + (autor.usuarioId ? '' : ' (envío automático)'),
      valorAnterior: { estado: alerta.estado },
      valorNuevo: { estado: actualizada.estado, canal: actualizada.canal, destino: mensaje.destino },
    });
    return actualizada;
  }

  async atender(alertaId: number, autor: Autor) {
    const alerta = await this.db.alertaStock.findUnique({ where: { id: alertaId }, include: incluirAlerta });
    if (!alerta) throw noEncontrado('La alerta no existe.');

    const cambio = estadoDe(alerta.estado).atender(); // State: solo ENVIADA puede atenderse
    const actualizada = await this.db.alertaStock.update({
      where: { id: alertaId },
      data: { estado: cambio.estado, fechaAtendida: cambio.fechaAtendida },
    });
    this.bus.publicar('ACCION_REGISTRADA', {
      ...autor,
      accion: 'ATENDER_ALERTA',
      entidad: 'ALERTA_STOCK',
      entidadId: alertaId,
      descripcion: `Alerta de ${alerta.producto.sku} marcada como atendida`,
      valorAnterior: { estado: alerta.estado },
      valorNuevo: { estado: actualizada.estado },
    });
    return actualizada;
  }
}
