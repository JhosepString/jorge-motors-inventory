// Tipos de la API (mismos nombres que schema.prisma y el backend)

export type Rol = 'ADMINISTRADOR' | 'AUXILIAR_INVENTARIO';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA';
export type EstadoAlerta = 'PENDIENTE' | 'ENVIADA' | 'ATENDIDA';
export type Canal = 'CORREO' | 'SMS' | 'WHATSAPP';
export type UnidadMedida = 'UNIDAD' | 'LITRO' | 'GALON' | 'JUEGO' | 'KIT' | 'METRO' | 'CAJA';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: Rol;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  productos?: number;
}

export interface ProductoStock {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  marca: string | null;
  unidadMedida: UnidadMedida;
  /** Solo llegan al administrador */
  precioCompra?: number;
  precioVenta?: number;
  stockMinimo: number;
  categoriaId: number;
  categoria: string;
  proveedorId: number | null;
  proveedor: string | null;
  cantidadActual: number;
  ubicacion: string | null;
  activo: boolean;
}

export interface DatosProducto {
  sku: string;
  nombre: string;
  descripcion: string | null;
  marca: string | null;
  unidadMedida: UnidadMedida;
  precioCompra: number;
  precioVenta: number;
  stockMinimo: number;
  categoriaId: number;
  proveedorId: number | null;
  ubicacion: string | null;
}

export interface FiltroProductos {
  buscar?: string;
  categoriaId?: number;
  soloBajoMinimo?: boolean;
  incluirInactivos?: boolean;
}

export interface Proveedor {
  id: number;
  ruc: string;
  razonSocial: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  canalPreferido: Canal;
  activo: boolean;
  productos: number;
}

export type DatosProveedor = Omit<Proveedor, 'id' | 'activo' | 'productos'>;

export interface Movimiento {
  id: number;
  fecha: string;
  productoId: number;
  sku: string;
  producto: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockResultante: number;
  motivo: string | null;
  referencia: string | null;
  usuarioId: number;
  registradoPor: string;
}

export interface NuevoMovimiento {
  productoId: number;
  cantidad: number;
  referencia?: string | null;
  motivo?: string | null;
}

export interface ResultadoMovimiento {
  movimiento: Movimiento;
  stockResultante: number;
  bajoMinimo: boolean;
}

export interface FiltroMovimientos {
  productoId?: number;
  usuarioId?: number;
  tipo?: TipoMovimiento;
  desde?: string;
  hasta?: string;
  limite?: number;
}

export interface Alerta {
  id: number;
  productoId: number;
  sku: string;
  producto: string;
  stockActual: number;
  stockDetectado: number;
  stockMinimo: number;
  proveedorId: number | null;
  proveedor: string | null;
  canalPreferido: Canal | null;
  estado: EstadoAlerta;
  canal: Canal | null;
  acciones: ('enviar' | 'atender')[];
  fechaGenerada: string;
  fechaEnviada: string | null;
  fechaAtendida: string | null;
}

export interface MensajeEnviado {
  canal: Canal;
  destino: string;
  texto: string;
  fecha: string;
}

export interface ResumenPanel {
  productosActivos: number;
  unidades: number;
  bajoMinimo: number;
  valorInventario: number;
  unidadesPorCategoria: { categoria: string; unidades: number }[];
  alertasAbiertas: {
    id: number; sku: string; producto: string; estado: EstadoAlerta;
    stockDetectado: number; stockMinimo: number; proveedor: string | null; fechaGenerada: string;
  }[];
  ultimosMovimientos: Movimiento[];
}

export interface InventarioValorizado {
  generado: string;
  totalProductos: number;
  totalUnidades: number;
  totalValor: number;
  categorias: { categoria: string; productos: number; unidades: number; valor: number }[];
  productos: (ProductoStock & { valorInventario: number; estadoStock: 'AGOTADO' | 'CRITICO' | 'NORMAL' })[];
}

export interface Kardex {
  producto: { id: number; sku: string; nombre: string; categoria: string; stockActual: number; stockMinimo: number; precioCompra: number };
  movimientos: {
    id: number; fecha: string; tipo: TipoMovimiento; referencia: string | null; motivo: string | null;
    entrada: number; salida: number; saldo: number; registradoPor: string;
  }[];
}

export interface UsuarioAdmin extends Usuario {
  activo: boolean;
  movimientos: number;
  ultimoIngreso: string | null;
  creadoEn: string;
}

export interface DatosUsuario {
  nombres: string;
  apellidos: string;
  email: string;
  rol: Rol;
  password?: string;
}

export interface RegistroAuditoria {
  id: number;
  fecha: string;
  usuarioId: number | null;
  usuario: string | null;
  rol: Rol | null;
  accion: string;
  entidad: string;
  entidadId: number | null;
  descripcion: string;
  valorAnterior: unknown;
  valorNuevo: unknown;
  ip: string | null;
}

export interface PaginaAuditoria {
  total: number;
  pagina: number;
  porPagina: number;
  registros: RegistroAuditoria[];
}

export interface FiltroAuditoria {
  usuarioId?: number;
  accion?: string;
  entidad?: string;
  desde?: string;
  hasta?: string;
  pagina?: number;
  porPagina?: number;
}
