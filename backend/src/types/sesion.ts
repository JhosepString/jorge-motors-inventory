export type Rol = 'ADMINISTRADOR' | 'AUXILIAR_INVENTARIO';
export const ROLES: readonly Rol[] = ['ADMINISTRADOR', 'AUXILIAR_INVENTARIO'];

/** Usuario de la sesión, tal como queda en req.usuario después del filtro JWT */
export interface UsuarioSesion {
  id: number;
  rol: Rol;
  nombre: string;
}
