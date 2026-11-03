// Cliente de la API REST (/api/v1): agrega el token JWT y convierte los errores en ApiError
import { leerToken } from '../auth/almacen';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

export const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

/** Se dispara cuando la API responde 401 con una sesión abierta (token vencido o usuario desactivado) */
export const EVENTO_SESION_EXPIRADA = 'jm:sesion-expirada';

async function enviar(ruta: string, opciones: RequestInit = {}): Promise<Response> {
  const token = leerToken();
  let respuesta: Response;
  try {
    respuesta = await fetch(BASE + ruta, {
      ...opciones,
      headers: {
        ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opciones.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.');
  }
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    if (respuesta.status === 401 && token) window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    throw new ApiError(respuesta.status, cuerpo?.mensaje ?? `Error ${respuesta.status}`);
  }
  return respuesta;
}

export async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const r = await enviar(ruta, opciones);
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

export const get = <T>(ruta: string) => pedir<T>(ruta);
export const post = <T>(ruta: string, cuerpo?: unknown) =>
  pedir<T>(ruta, { method: 'POST', body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });
export const put = <T>(ruta: string, cuerpo: unknown) => pedir<T>(ruta, { method: 'PUT', body: JSON.stringify(cuerpo) });
export const patch = <T>(ruta: string, cuerpo?: unknown) =>
  pedir<T>(ruta, { method: 'PATCH', body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });

/** Arma "?a=1&b=2" ignorando los valores vacíos */
export function consulta(params: object = {}): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '' && v !== false) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Descarga un archivo protegido (CSV) con el token y lo guarda en el equipo */
export async function descargar(ruta: string, nombrePorDefecto: string): Promise<void> {
  const r = await enviar(ruta);
  const nombre = /filename="([^"]+)"/.exec(r.headers.get('Content-Disposition') ?? '')?.[1] ?? nombrePorDefecto;
  const url = URL.createObjectURL(await r.blob());
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
