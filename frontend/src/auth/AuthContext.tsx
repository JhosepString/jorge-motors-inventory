import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, EVENTO_SESION_EXPIRADA } from '../api';
import type { Usuario } from '../api';
import { borrarSesion, guardarSesion, leerSesion } from './almacen';
import { Contexto } from './sesion';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => leerSesion()?.usuario ?? null);

  const iniciarSesion = useCallback(async (email: string, password: string, recordar: boolean) => {
    const sesion = await api.login(email, password);
    guardarSesion(sesion, recordar);
    setUsuario(sesion.usuario);
    return sesion.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    void api.logout().catch(() => undefined); // queda en auditoría; si falla, igual se cierra
    borrarSesion();
    setUsuario(null);
  }, []);

  // Si la API responde 401 (token vencido o usuario desactivado), se cierra la sesión local
  useEffect(() => {
    const expirar = () => {
      borrarSesion();
      setUsuario(null);
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, expirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, expirar);
  }, []);

  const valor = useMemo(() => ({ usuario, iniciarSesion, cerrarSesion }), [usuario, iniciarSesion, cerrarSesion]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
