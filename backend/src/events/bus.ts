// Observer / Event-Driven: los módulos publican eventos y otros reaccionan sin conocerse
import { EventEmitter } from 'node:events';
import type { Rol } from '../types/sesion.ts';

export type AccionAuditoria =
  | 'LOGIN' | 'LOGIN_FALLIDO' | 'LOGOUT'
  | 'CREAR' | 'EDITAR' | 'DESACTIVAR' | 'ACTIVAR'
  | 'REGISTRAR_ENTRADA' | 'REGISTRAR_SALIDA'
  | 'ENVIAR_ALERTA' | 'ATENDER_ALERTA' | 'EXPORTAR_REPORTE';

export type EntidadAuditoria =
  | 'SESION' | 'USUARIO' | 'CATEGORIA' | 'PROVEEDOR' | 'PRODUCTO'
  | 'STOCK' | 'MOVIMIENTO' | 'ALERTA_STOCK' | 'REPORTE';

export interface AccionRegistrada {
  usuarioId: number | null;
  rol: Rol | null;
  accion: AccionAuditoria;
  entidad: EntidadAuditoria;
  entidadId?: number | null;
  descripcion: string;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
  ip?: string | null;
}

interface Eventos {
  /** Inventario lo publica después de confirmar una entrada o salida */
  STOCK_ACTUALIZADO: { productoId: number };
  /** Cualquier módulo lo publica cuando un usuario hace algo que debe quedar en auditoría */
  ACCION_REGISTRADA: AccionRegistrada;
}

type Manejador<T> = (datos: T) => void | Promise<void>;

export class BusEventos {
  private readonly emisor = new EventEmitter();
  private pendientes = new Set<Promise<void>>();

  publicar<K extends keyof Eventos>(evento: K, datos: Eventos[K]): void {
    this.emisor.emit(evento, datos);
  }

  suscribir<K extends keyof Eventos>(evento: K, manejador: Manejador<Eventos[K]>): void {
    this.emisor.on(evento, (datos: Eventos[K]) => {
      const tarea = Promise.resolve()
        .then(() => manejador(datos))
        .catch((error: unknown) => console.error(`[eventos] Falló un suscriptor de ${evento}:`, error))
        .finally(() => this.pendientes.delete(tarea));
      this.pendientes.add(tarea);
    });
  }

  /** Espera a que terminen los suscriptores en curso (útil en pruebas) */
  async esperar(): Promise<void> {
    while (this.pendientes.size) await Promise.all([...this.pendientes]);
  }
}

export const eventos = new BusEventos();
