// Punto único de acceso a la API: las pantallas usan "api.*" y no arman URLs
import { consulta, descargar, get, patch, post, put } from './http';
import type {
  Alerta, Categoria, DatosProducto, DatosProveedor, DatosUsuario, FiltroAuditoria, FiltroMovimientos,
  FiltroProductos, InventarioValorizado, Kardex, MensajeEnviado, Movimiento, NuevoMovimiento, PaginaAuditoria,
  ProductoStock, Proveedor, ResultadoMovimiento, ResumenPanel, Sesion, Usuario, UsuarioAdmin,
} from './tipos';

export const api = {
  login: (email: string, password: string) => post<Sesion>('/auth/login', { email, password }),
  me: () => get<Usuario>('/auth/me'),
  logout: () => post<void>('/auth/logout'),

  panel: () => get<ResumenPanel>('/panel/resumen'),

  categorias: () => get<Categoria[]>('/categorias'),
  crearCategoria: (d: { nombre: string; descripcion: string | null }) => post<Categoria>('/categorias', d),

  productos: (f: FiltroProductos = {}) => get<ProductoStock[]>(`/productos${consulta(f)}`),
  crearProducto: (d: DatosProducto) => post<ProductoStock>('/productos', d),
  editarProducto: (id: number, d: DatosProducto) => put<ProductoStock>(`/productos/${id}`, d),
  estadoProducto: (id: number, activo: boolean) => patch<ProductoStock>(`/productos/${id}/estado`, { activo }),

  proveedores: (incluirInactivos = false) => get<Proveedor[]>(`/proveedores${consulta({ incluirInactivos })}`),
  crearProveedor: (d: DatosProveedor) => post<Proveedor>('/proveedores', d),
  editarProveedor: (id: number, d: DatosProveedor) => put<Proveedor>(`/proveedores/${id}`, d),
  estadoProveedor: (id: number, activo: boolean) => patch<Proveedor>(`/proveedores/${id}/estado`, { activo }),

  registrarSalida: (d: NuevoMovimiento) => post<ResultadoMovimiento>('/movimientos/salida', d),
  registrarEntrada: (d: NuevoMovimiento) => post<ResultadoMovimiento>('/movimientos/entrada', d),
  movimientos: (f: FiltroMovimientos = {}) => get<Movimiento[]>(`/movimientos${consulta(f)}`),
  misMovimientos: (limite = 5) => get<Movimiento[]>(`/movimientos/mios${consulta({ limite })}`),

  alertas: () => get<Alerta[]>('/alertas'),
  enviarAlerta: (id: number) => patch<Alerta>(`/alertas/${id}/enviar`),
  atenderAlerta: (id: number) => patch<Alerta>(`/alertas/${id}/atender`),
  bandeja: () => get<MensajeEnviado[]>('/alertas/bandeja'),

  inventario: () => get<InventarioValorizado>('/reportes/inventario'),
  kardex: (productoId: number) => get<Kardex>(`/reportes/kardex${consulta({ productoId })}`),
  descargarInventario: () => descargar('/reportes/inventario.csv', 'inventario-valorizado.csv'),
  descargarKardex: (productoId: number) => descargar(`/reportes/kardex.csv${consulta({ productoId })}`, 'kardex.csv'),
  reporteImpreso: (reporte: 'inventario' | 'kardex', productoId?: number) => post<void>('/reportes/exportado', { reporte, productoId }),

  usuarios: () => get<UsuarioAdmin[]>('/usuarios'),
  crearUsuario: (d: DatosUsuario) => post<UsuarioAdmin>('/usuarios', d),
  editarUsuario: (id: number, d: DatosUsuario) => put<UsuarioAdmin>(`/usuarios/${id}`, d),
  estadoUsuario: (id: number, activo: boolean) => patch<UsuarioAdmin>(`/usuarios/${id}/estado`, { activo }),
  cambiarPassword: (id: number, password: string) => patch<void>(`/usuarios/${id}/password`, { password }),

  auditoria: (f: FiltroAuditoria = {}) => get<PaginaAuditoria>(`/auditoria${consulta(f)}`),
  miActividad: (f: FiltroAuditoria = {}) => get<PaginaAuditoria>(`/auditoria/mia${consulta(f)}`),
};

export { ApiError, EVENTO_SESION_EXPIRADA } from './http';
export type * from './tipos';
