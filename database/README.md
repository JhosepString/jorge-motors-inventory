# Base de datos

Base de datos del sistema en **SQL Server**, administrada con **SQL Server Management Studio (SSMS)** y conectada al backend con **Prisma** (`provider = "sqlserver"`).

## Tablas

| Tabla | Contenido |
| --- | --- |
| `usuario` | Personas que usan el sistema, con rol ADMINISTRADOR o AUXILIAR_INVENTARIO |
| `categoria` | Clasificación de productos (Repuestos, Lubricantes, Filtros, etc.) |
| `proveedor` | Empresas que reponen el inventario, su ciudad y su canal de aviso (correo, SMS o WhatsApp) |
| `producto` | Catálogo de repuestos e insumos, con su stock mínimo |
| `stock` | Cantidad actual y ubicación de cada producto (1:1 con producto) |
| `movimiento` | Historial de entradas y salidas (kardex); no se puede editar ni borrar |
| `alerta_stock` | Avisos de bajo stock con estado PENDIENTE → ENVIADA → ATENDIDA |
| `auditoria` | Registro de lo que hace cada usuario (inicios de sesión, altas, ediciones, salidas, alertas, reportes); no se puede editar ni borrar |

Además: 11 índices, 7 triggers y 3 vistas (`v_inventario`, `v_kardex` y `v_auditoria`).

## Reglas principales

- El stock nunca puede quedar negativo.
- Cada movimiento debe cuadrar: stock resultante = stock anterior ± cantidad.
- Los movimientos y los registros de auditoría no se pueden editar ni eliminar.
- Solo puede haber una alerta abierta por producto.
- Una alerta solo puede pasar de PENDIENTE a ENVIADA y de ENVIADA a ATENDIDA.
- El proveedor debe tener correo si su canal es CORREO, o teléfono si es SMS o WhatsApp.
- Los detalles de la auditoría (valor anterior y nuevo) deben ser JSON válido.
- Los proveedores no se borran: se desactivan (`activo = 0`).

## Archivos

| Archivo | Uso |
| --- | --- |
| `schema.sql` | Crea la base `jorge_motors` y toda su estructura. Puede volver a ejecutarse. |
| `usuario_aplicacion.sql` | Crea el usuario `jorge_app` que usará el backend. Se ejecuta una vez. |
| `schema.prisma` | El mismo esquema para Prisma (camelCase en el código, snake_case en la base). |
| `pruebas/datos_prueba.sql` | Datos de ejemplo: 3 usuarios, 7 categorías, 3 proveedores, 15 productos, 35 movimientos, 4 alertas y 11 registros de auditoría. |
| `pruebas/casos/P01` a `P10` | Pruebas de integridad: P1 debe ejecutarse; P2 a P10 deben ser rechazadas. |
| `GUIA_SQL_SERVER.md` | Instalación, ejecución en SSMS, pruebas y conexión con Prisma. |
| `sqlite_avance2/` | Versión SQLite del Avance 2, como historial. |

La base se crea con `schema.sql`, **no** con `prisma migrate` ni `prisma db push`: Prisma no puede expresar las restricciones CHECK, el índice filtrado ni los triggers.
