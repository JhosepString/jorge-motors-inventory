import { Navigate, Outlet, useLocation } from 'react-router';
import type { Rol } from '../api';
import { inicioDeRol, useAuth } from './sesion';

/** Deja pasar solo a usuarios con sesión y con uno de los roles permitidos */
export function RutaProtegida({ roles }: { roles: Rol[] }) {
  const { usuario } = useAuth();
  const ubicacion = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (!roles.includes(usuario.rol)) return <Navigate to={inicioDeRol(usuario.rol)} replace />;
  return <Outlet />;
}
