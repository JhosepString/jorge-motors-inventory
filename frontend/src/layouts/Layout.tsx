import { NavLink, Outlet, useNavigate } from 'react-router';
import type { ReactNode } from 'react';
import { nombreRol, useAuth } from '../auth/sesion';
import {
  IconoAuditoria, IconoBuscar, IconoCaja, IconoCamion, IconoCampana, IconoFlechas, IconoHistorial,
  IconoLlave, IconoPanel, IconoReporte, IconoSalida, IconoUsuarios,
} from '../components/Iconos';

interface ItemMenu {
  ruta: string;
  texto: string;
  icono: ReactNode;
}

const menuAdministrador: ItemMenu[] = [
  { ruta: '/admin/panel', texto: 'Panel', icono: <IconoPanel /> },
  { ruta: '/admin/productos', texto: 'Productos y stock', icono: <IconoCaja /> },
  { ruta: '/admin/movimientos', texto: 'Movimientos', icono: <IconoFlechas /> },
  { ruta: '/admin/alertas', texto: 'Alertas', icono: <IconoCampana /> },
  { ruta: '/admin/reportes', texto: 'Reportes', icono: <IconoReporte /> },
  { ruta: '/admin/proveedores', texto: 'Proveedores', icono: <IconoCamion /> },
  { ruta: '/admin/usuarios', texto: 'Usuarios', icono: <IconoUsuarios /> },
  { ruta: '/admin/auditoria', texto: 'Auditoría', icono: <IconoAuditoria /> },
];

const menuAuxiliar: ItemMenu[] = [
  { ruta: '/auxiliar/salida', texto: 'Registrar salida', icono: <IconoSalida /> },
  { ruta: '/auxiliar/stock', texto: 'Consultar stock', icono: <IconoBuscar /> },
  { ruta: '/auxiliar/actividad', texto: 'Mi actividad', icono: <IconoHistorial /> },
];

/** Estructura común: menú lateral según el rol + contenido de la página */
export function Layout() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  if (!usuario) return null;

  const esAdmin = usuario.rol === 'ADMINISTRADOR';
  const items = esAdmin ? menuAdministrador : menuAuxiliar;

  const salir = () => {
    cerrarSesion();
    navegar('/login', { replace: true });
  };

  return (
    <div className="app">
      <nav className="menu" aria-label={esAdmin ? 'Menú del administrador' : 'Menú del auxiliar de inventario'}>
        <div className="marca">
          <div className="marca__logo"><IconoLlave /></div>
          <div>
            <div className="marca__nombre">Jorge Motors</div>
            <div className="marca__sub">{esAdmin ? 'Gestión de inventario' : 'Taller · auxiliar de inventario'}</div>
          </div>
        </div>
        <div className="menu__lista">
          {items.map((item) => (
            <NavLink key={item.ruta} to={item.ruta} className={({ isActive }) => `menu__item${isActive ? ' activo' : ''}`}>
              {item.icono}
              {item.texto}
            </NavLink>
          ))}
        </div>
        {!esAdmin && (
          <p className="menu__nota">
            Tu rol muestra solo lo que necesitas en el taller. Productos, proveedores y reportes los gestiona el administrador.
          </p>
        )}
        <div className="menu__usuario">
          <div className="menu__usuario-nombre">{usuario.nombres} {usuario.apellidos}</div>
          <div className="menu__usuario-rol">{nombreRol[usuario.rol]}</div>
          <button type="button" className="menu__salir" onClick={salir}>Cerrar sesión</button>
        </div>
      </nav>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
