// Guarda la sesión: localStorage si el usuario marcó "Mantener la sesión", si no sessionStorage
import type { Sesion } from '../api/tipos';

const CLAVE = 'jm.sesion';

function leer(storage: Storage): Sesion | null {
  try {
    const crudo = storage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Sesion) : null;
  } catch {
    return null;
  }
}

export function leerSesion(): Sesion | null {
  return leer(localStorage) ?? leer(sessionStorage);
}

export function leerToken(): string | null {
  return leerSesion()?.token ?? null;
}

export function guardarSesion(sesion: Sesion, recordar: boolean): void {
  borrarSesion();
  try {
    (recordar ? localStorage : sessionStorage).setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    // Si el navegador bloquea el almacenamiento, la sesión dura solo mientras la página esté abierta
  }
}

export function borrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE);
    sessionStorage.removeItem(CLAVE);
  } catch {
    // sin almacenamiento disponible
  }
}
