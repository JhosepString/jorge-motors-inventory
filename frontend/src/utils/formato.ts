// Formatos para Perú: hora de Lima y soles

const zona = 'America/Lima';

export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: zona, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso)).replace(',', '');
}

export function hoyLargo(): string {
  const texto = new Intl.DateTimeFormat('es-PE', {
    timeZone: zona, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function soles(monto: number): string {
  return 'S/ ' + monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function estaBajoMinimo(p: { cantidadActual: number; stockMinimo: number }): boolean {
  return p.cantidadActual < p.stockMinimo;
}

export function fechaHora(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: zona, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso)).replace(',', '');
}

export function numero(n: number): string {
  return n.toLocaleString('es-PE');
}

/** Fecha de hoy en Lima como "AAAA-MM-DD" (para los filtros por fecha) */
export function hoyIso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zona }).format(new Date());
}

export const nombreCanal = { CORREO: 'Correo', SMS: 'SMS', WHATSAPP: 'WhatsApp' } as const;
export const nombreUnidad = {
  UNIDAD: 'Unidad', LITRO: 'Litro', GALON: 'Galón', JUEGO: 'Juego', KIT: 'Kit', METRO: 'Metro', CAJA: 'Caja',
} as const;

/** Convierte un rango de días (AAAA-MM-DD, hora de Lima) a instantes para la API; "hasta" incluye todo ese día */
export function rangoLima(desde: string, hasta: string): { desde?: string; hasta?: string } {
  const siguiente = (d: string) => {
    const f = new Date(`${d}T00:00:00Z`);
    f.setUTCDate(f.getUTCDate() + 1);
    return f.toISOString().slice(0, 10);
  };
  return {
    desde: desde ? `${desde}T00:00:00-05:00` : undefined,
    hasta: hasta ? `${siguiente(hasta)}T00:00:00-05:00` : undefined,
  };
}
