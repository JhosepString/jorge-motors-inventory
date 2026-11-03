// State: cada estado de la alerta decide qué acciones permite.
// La base de datos repite la regla con el trigger trg_alerta_transicion (segunda barrera).
import type { Canal } from './canales.ts';
import { conflicto } from '../../utils/errores.ts';

export type NombreEstado = 'PENDIENTE' | 'ENVIADA' | 'ATENDIDA';

export interface CambioEstado {
  estado: NombreEstado;
  canal?: Canal;
  fechaEnviada?: Date;
  fechaAtendida?: Date;
}

export abstract class EstadoAlerta {
  abstract readonly nombre: NombreEstado;
  /** Acciones que la interfaz puede ofrecer en este estado */
  abstract readonly acciones: readonly ('enviar' | 'atender')[];

  enviar(_canal: Canal): CambioEstado {
    throw conflicto(`Una alerta ${this.nombre.toLowerCase()} no se puede enviar.`);
  }

  atender(): CambioEstado {
    throw conflicto(`Una alerta ${this.nombre.toLowerCase()} no se puede marcar como atendida.`);
  }
}

export class Pendiente extends EstadoAlerta {
  readonly nombre = 'PENDIENTE' as const;
  readonly acciones = ['enviar'] as const;

  override enviar(canal: Canal): CambioEstado {
    return { estado: 'ENVIADA', canal, fechaEnviada: new Date() };
  }
}

export class Enviada extends EstadoAlerta {
  readonly nombre = 'ENVIADA' as const;
  readonly acciones = ['atender'] as const;

  override atender(): CambioEstado {
    return { estado: 'ATENDIDA', fechaAtendida: new Date() };
  }
}

export class Atendida extends EstadoAlerta {
  readonly nombre = 'ATENDIDA' as const;
  readonly acciones = [] as const;
}

const estados: Record<NombreEstado, EstadoAlerta> = {
  PENDIENTE: new Pendiente(),
  ENVIADA: new Enviada(),
  ATENDIDA: new Atendida(),
};

export function estadoDe(nombre: string): EstadoAlerta {
  const estado = estados[nombre as NombreEstado];
  if (!estado) throw new Error(`Estado de alerta desconocido: ${nombre}`);
  return estado;
}
