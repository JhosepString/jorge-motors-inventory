import { createBrowserRouter, Navigate } from 'react-router';
import { RutaProtegida } from './auth/RutaProtegida';
import { Layout } from './layouts/Layout';
import { Inicio } from './pages/Inicio';
import { Login } from './pages/Login';
import { Alertas } from './pages/admin/Alertas';
import { Auditoria } from './pages/admin/Auditoria';
import { Movimientos } from './pages/admin/Movimientos';
import { Panel } from './pages/admin/Panel';
import { Productos } from './pages/admin/Productos';
import { Proveedores } from './pages/admin/Proveedores';
import { Reportes } from './pages/admin/Reportes';
import { Usuarios } from './pages/admin/Usuarios';
import { ConsultarStock } from './pages/auxiliar/ConsultarStock';
import { MiActividad } from './pages/auxiliar/MiActividad';
import { RegistrarSalida } from './pages/auxiliar/RegistrarSalida';

export const router = createBrowserRouter([
  { path: '/', element: <Inicio /> },
  { path: '/login', element: <Login /> },
  {
    path: '/admin',
    element: <RutaProtegida roles={['ADMINISTRADOR']} />,
    children: [{
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="panel" replace /> },
        { path: 'panel', element: <Panel /> },
        { path: 'productos', element: <Productos /> },
        { path: 'movimientos', element: <Movimientos /> },
        { path: 'alertas', element: <Alertas /> },
        { path: 'reportes', element: <Reportes /> },
        { path: 'proveedores', element: <Proveedores /> },
        { path: 'usuarios', element: <Usuarios /> },
        { path: 'auditoria', element: <Auditoria /> },
      ],
    }],
  },
  {
    path: '/auxiliar',
    element: <RutaProtegida roles={['AUXILIAR_INVENTARIO']} />,
    children: [{
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="salida" replace /> },
        { path: 'salida', element: <RegistrarSalida /> },
        { path: 'stock', element: <ConsultarStock /> },
        { path: 'actividad', element: <MiActividad /> },
      ],
    }],
  },
  { path: '*', element: <Inicio /> },
]);
