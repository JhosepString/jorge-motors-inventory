import { Navigate } from 'react-router';
import { inicioDeRol, useAuth } from '../auth/sesion';

/** Redirige a la pantalla de inicio según el rol, o al login si no hay sesión */
export function Inicio() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? inicioDeRol(usuario.rol) : '/login'} replace />;
}
