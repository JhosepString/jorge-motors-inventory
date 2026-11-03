import { createContext, useContext } from 'react';
import type { Rol, Usuario } from '../api';

export interface ContextoAuth {
  usuario: Usuario | null;
  iniciarSesion: (email: string, password: string, recordar: boolean) => Promise<Usuario>;
  cerrarSesion: () => void;
}

export const Contexto = createContext<ContextoAuth | null>(null);

export function useAuth(): ContextoAuth {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

/** Ruta de inicio de cada rol */
export function inicioDeRol(rol: Rol): string {
  return rol === 'ADMINISTRADOR' ? '/admin/panel' : '/auxiliar/salida';
}

export const nombreRol: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  AUXILIAR_INVENTARIO: 'Auxiliar de inventario',
};
