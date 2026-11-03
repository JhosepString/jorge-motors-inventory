// Facade + transacción atómica (RNF-04): una sola operación para el controlador,
// que por dentro descuenta o suma el stock, registra el movimiento y publica el evento.
import type { Prisma } from '../../db/prisma.ts';
import type { BusEventos } from '../../events/bus.ts';
import type { UsuarioSesion } from '../../types/sesion.ts';
import { conflicto, noEncontrado } from '../../utils/errores.ts';

export interface DatosMovimiento {
  productoId: number;
  cantidad: number;
  referencia: string | null;
  motivo: string | null;
}

const incluirMovimiento = {
  producto: { select: { sku: true, nombre: true, stockMinimo: true } },
  usuario: { select: { nombres: true, apellidos: true } },
} as const;

export type MovimientoCompleto = Awaited<ReturnType<InventarioFacade['registrarSalida']>>;

export class InventarioFacade {
  private readonly db: Prisma;
  private readonly bus: BusEventos;

  constructor(db: Prisma, bus: BusEventos) {
    this.db = db;
    this.bus = bus;
  }

  async registrarSalida(dto: DatosMovimiento, usuario: UsuarioSesion) {
    const movimiento = await this.db.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: dto.productoId } });
      if (!producto || !producto.activo) throw noEncontrado('El repuesto no existe o está desactivado.');

      // Descuento condicional: solo descuenta si alcanza (evita stock negativo y doble descuento concurrente)
      const r = await tx.stock.updateMany({
        where: { productoId: dto.productoId, cantidadActual: { gte: dto.cantidad } },
        data: { cantidadActual: { decrement: dto.cantidad }, ultimaActualizacion: new Date() },
      });
      if (r.count === 0) {
        const actual = await tx.stock.findUnique({ where: { productoId: dto.productoId } });
        throw conflicto(`Stock insuficiente: solo quedan ${actual?.cantidadActual ?? 0} unidades.`);
      }

      const stock = await tx.stock.findUniqueOrThrow({ where: { productoId: dto.productoId } });
      return tx.movimiento.create({
        data: {
          productoId: dto.productoId,
          usuarioId: usuario.id,
          tipo: 'SALIDA',
          cantidad: dto.cantidad,
          stockAnterior: stock.cantidadActual + dto.cantidad,
          stockResultante: stock.cantidadActual,
          motivo: dto.motivo ?? 'Uso en servicio de mantenimiento',
          referencia: dto.referencia,
        },
        include: incluirMovimiento,
      });
    });

    // Observer: después del commit, Inventario solo avisa que el stock cambió
    this.bus.publicar('STOCK_ACTUALIZADO', { productoId: dto.productoId });
    return movimiento;
  }

  async registrarEntrada(dto: DatosMovimiento, usuario: UsuarioSesion) {
    const movimiento = await this.db.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: dto.productoId } });
      if (!producto || !producto.activo) throw noEncontrado('El producto no existe o está desactivado.');

      const stock = await tx.stock.upsert({
        where: { productoId: dto.productoId },
        update: { cantidadActual: { increment: dto.cantidad }, ultimaActualizacion: new Date() },
        create: { productoId: dto.productoId, cantidadActual: dto.cantidad },
      });
      return tx.movimiento.create({
        data: {
          productoId: dto.productoId,
          usuarioId: usuario.id,
          tipo: 'ENTRADA',
          cantidad: dto.cantidad,
          stockAnterior: stock.cantidadActual - dto.cantidad,
          stockResultante: stock.cantidadActual,
          motivo: dto.motivo ?? 'Compra a proveedor',
          referencia: dto.referencia,
        },
        include: incluirMovimiento,
      });
    });

    this.bus.publicar('STOCK_ACTUALIZADO', { productoId: dto.productoId });
    return movimiento;
  }
}
