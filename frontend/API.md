# Contrato de la API (`/api/v1`)

Todas las rutas, salvo `/salud` y `/auth/login`, piden `Authorization: Bearer <token>`. Los errores llegan como `{ "mensaje": "..." }` con el código HTTP correspondiente (400 validación, 401 sin sesión, 403 sin permiso, 404 no existe, 409 conflicto).

| Método | Ruta | Rol | Descripción |
| --- | --- | --- | --- |
| GET | `/salud` | — | Estado de la API y de la base de datos |
| POST | `/auth/login` | — | `{email, password}` → `{token, usuario}` |
| GET | `/auth/me` | Ambos | Usuario de la sesión |
| POST | `/auth/logout` | Ambos | Registra el cierre en auditoría (204) |
| GET | `/panel/resumen` | Admin | Indicadores, alertas abiertas y últimos movimientos |
| GET | `/categorias` | Ambos | Categorías con cantidad de productos |
| POST / PUT | `/categorias`, `/categorias/:id` | Admin | `{nombre, descripcion}` |
| GET | `/productos?buscar&categoriaId&soloBajoMinimo&incluirInactivos` | Ambos | Productos con stock; los precios solo llegan al administrador |
| GET | `/productos/:id` | Ambos | Un producto |
| POST / PUT | `/productos`, `/productos/:id` | Admin | Crear (con stock 0) o editar |
| PATCH | `/productos/:id/estado` | Admin | `{activo}` |
| GET | `/proveedores?incluirInactivos` | Admin | Proveedores con cantidad de productos |
| POST / PUT | `/proveedores`, `/proveedores/:id` | Admin | RUC de 11 dígitos; correo obligatorio para CORREO, teléfono para SMS / WHATSAPP |
| PATCH | `/proveedores/:id/estado` | Admin | `{activo}` |
| POST | `/movimientos/salida` | Ambos | `{productoId, cantidad, referencia (OT), motivo?}` → `{movimiento, stockResultante, bajoMinimo}` |
| POST | `/movimientos/entrada` | Admin | `{productoId, cantidad, referencia?, motivo?}` |
| GET | `/movimientos?productoId&usuarioId&tipo&desde&hasta&limite` | Admin | Historial |
| GET | `/movimientos/mios?limite` | Ambos | Últimas salidas del usuario |
| GET | `/alertas?estado` | Admin | Alertas con las `acciones` que permite su estado |
| PATCH | `/alertas/:id/enviar`, `/alertas/:id/atender` | Admin | Cambio de estado (409 si el estado no lo permite) |
| GET | `/alertas/bandeja` | Admin | Últimos avisos enviados (simulados) |
| GET | `/reportes/inventario`, `/reportes/inventario.csv` | Admin | Inventario valorizado |
| GET | `/reportes/kardex?productoId`, `/reportes/kardex.csv?productoId` | Admin | Kardex con saldo |
| POST | `/reportes/exportado` | Admin | `{reporte, productoId?}`: registra en auditoría una exportación a PDF |
| GET | `/usuarios` | Admin | Usuarios con movimientos y último ingreso |
| POST / PUT | `/usuarios`, `/usuarios/:id` | Admin | Crear (con `password`, mínimo 8) o editar |
| PATCH | `/usuarios/:id/estado`, `/usuarios/:id/password` | Admin | Activar / desactivar y cambiar contraseña |
| GET | `/auditoria?usuarioId&accion&entidad&desde&hasta&pagina&porPagina` | Admin | `{total, pagina, porPagina, registros}` |
| GET | `/auditoria/mia?pagina&porPagina` | Ambos | Actividad del propio usuario |

Las fechas viajan en ISO 8601 (UTC); el frontend las muestra en hora de Lima. En los filtros, `hasta` es exclusivo.
