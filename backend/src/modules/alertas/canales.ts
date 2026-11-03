// Strategy: una clase por canal de aviso; el notificador elige según proveedor.canalPreferido.
// En esta versión los envíos son simulados (se registran en consola y en la bandeja de salida);
// para enviar de verdad, solo cambia el cuerpo de enviar() de cada estrategia.
import { solicitudInvalida } from '../../utils/errores.ts';

export type Canal = 'CORREO' | 'SMS' | 'WHATSAPP';

export interface AvisoBajoStock {
  alertaId: number;
  proveedor: { razonSocial: string; email: string | null; telefono: string | null };
  producto: { sku: string; nombre: string };
  stockDetectado: number;
  stockMinimo: number;
}

export interface MensajeEnviado {
  canal: Canal;
  destino: string;
  texto: string;
  fecha: string;
}

/** Últimos mensajes "enviados" (simulación), para verlos desde la API */
export const bandejaSalida: MensajeEnviado[] = [];

export interface CanalNotificacion {
  readonly canal: Canal;
  enviar(aviso: AvisoBajoStock): Promise<MensajeEnviado>;
}

function texto(a: AvisoBajoStock): string {
  return `Jorge Motors: el repuesto ${a.producto.sku} · ${a.producto.nombre} quedó con ${a.stockDetectado} ${a.stockDetectado === 1 ? 'unidad' : 'unidades'} `
    + `(mínimo ${a.stockMinimo}). Por favor, coordine la reposición. Alerta #${a.alertaId}.`;
}

function registrar(canal: Canal, destino: string, contenido: string): MensajeEnviado {
  const mensaje = { canal, destino, texto: contenido, fecha: new Date().toISOString() };
  bandejaSalida.unshift(mensaje);
  bandejaSalida.length = Math.min(bandejaSalida.length, 50);
  console.info(`[aviso ${canal}] → ${destino}: ${contenido}`);
  return mensaje;
}

export class CorreoStrategy implements CanalNotificacion {
  readonly canal = 'CORREO' as const;
  async enviar(aviso: AvisoBajoStock) {
    if (!aviso.proveedor.email) throw solicitudInvalida(`${aviso.proveedor.razonSocial} no tiene correo registrado.`);
    return registrar(this.canal, aviso.proveedor.email, texto(aviso));
  }
}

export class SmsStrategy implements CanalNotificacion {
  readonly canal = 'SMS' as const;
  async enviar(aviso: AvisoBajoStock) {
    if (!aviso.proveedor.telefono) throw solicitudInvalida(`${aviso.proveedor.razonSocial} no tiene teléfono registrado.`);
    return registrar(this.canal, aviso.proveedor.telefono, texto(aviso));
  }
}

export class WhatsAppStrategy implements CanalNotificacion {
  readonly canal = 'WHATSAPP' as const;
  async enviar(aviso: AvisoBajoStock) {
    if (!aviso.proveedor.telefono) throw solicitudInvalida(`${aviso.proveedor.razonSocial} no tiene teléfono registrado.`);
    return registrar(this.canal, `+51 ${aviso.proveedor.telefono}`, texto(aviso));
  }
}

const estrategias: Record<Canal, CanalNotificacion> = {
  CORREO: new CorreoStrategy(),
  SMS: new SmsStrategy(),
  WHATSAPP: new WhatsAppStrategy(),
};

export function estrategiaPara(canal: string): CanalNotificacion {
  const e = estrategias[canal as Canal];
  if (!e) throw solicitudInvalida(`Canal de aviso desconocido: ${canal}`);
  return e;
}
