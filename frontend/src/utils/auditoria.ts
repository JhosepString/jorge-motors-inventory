// Textos para mostrar las acciones y entidades de la auditoría

export const nombreAccion: Record<string, string> = {
  LOGIN: 'Inicio de sesión', LOGIN_FALLIDO: 'Ingreso fallido', LOGOUT: 'Cierre de sesión',
  CREAR: 'Crear', EDITAR: 'Editar', DESACTIVAR: 'Desactivar', ACTIVAR: 'Activar',
  REGISTRAR_ENTRADA: 'Entrada', REGISTRAR_SALIDA: 'Salida',
  ENVIAR_ALERTA: 'Enviar alerta', ATENDER_ALERTA: 'Atender alerta', EXPORTAR_REPORTE: 'Exportar reporte',
};

export const nombreEntidad: Record<string, string> = {
  SESION: 'Sesión', USUARIO: 'Usuario', CATEGORIA: 'Categoría', PROVEEDOR: 'Proveedor', PRODUCTO: 'Producto',
  STOCK: 'Stock', MOVIMIENTO: 'Movimiento', ALERTA_STOCK: 'Alerta', REPORTE: 'Reporte',
};
