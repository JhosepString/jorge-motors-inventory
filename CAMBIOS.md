# Cambios respecto al Avance 2

Decisiones tomadas por el grupo después del Avance 2 (15/10/2026):

| Antes | Ahora | Motivo |
| --- | --- | --- |
| SQLite (desarrollo) / PostgreSQL (producción) | **SQL Server**, administrado con SSMS (Azure SQL Database en la nube) | Motor elegido por el grupo; Prisma lo soporta con `provider = "sqlserver"` |
| DBeaver | **SSMS** | Herramienta oficial de SQL Server |
| Rol MECANICO | Rol **AUXILIAR_INVENTARIO** | El usuario operativo del sistema es el auxiliar de inventario |
| Sin auditoría | Tabla **auditoria** + vista `v_auditoria` | Trazabilidad de las acciones del administrador y del auxiliar de inventario |
| Backend, frontend y patrones | **Sin cambios** | Node.js + Express + TypeScript, React y los mismos patrones |

## Qué cambió en la base de datos

- 8 tablas (antes 7): se agrega `auditoria`, inmutable como `movimiento`.
- 11 índices, 7 triggers y 3 vistas (antes 8, 5 y 2).
- `usuario.rol` acepta solo `ADMINISTRADOR` y `AUXILIAR_INVENTARIO`.
- `alerta_stock.proveedor_id` pasa de SET NULL a NO ACTION: SQL Server no admite varios caminos de borrado en cascada hacia la misma tabla. Los proveedores se desactivan, no se borran.
- Tipos de SQL Server: `INT IDENTITY`, `NVARCHAR`, `BIT`, `DECIMAL(10,2)` y `DATETIME2` en UTC.
- Pruebas de integridad: 10 (antes 8). Se agregan P09 y P10 para la auditoría, y P07 ahora prueba que el rol MECANICO ya no se acepta.

## Cómo encaja la auditoría en la arquitectura

Cada módulo publica un evento cuando ocurre una acción (inicio de sesión, alta, edición, salida, envío de alerta, exportación). Un suscriptor de auditoría lo guarda en la tabla `auditoria`. Es el mismo patrón **Observer** que ya usan las alertas, así que ningún módulo depende del registro de auditoría.

## Backend (rama `jose`)

- API completa en `backend/`: Express 5 + TypeScript + Zod + helmet + Prisma 7 sobre SQL Server, con la misma base que el avance del compañero (pnpm, Express, Zod, helmet, supertest). Falta acordar en grupo cómo unir ambos backends.
- Módulos: auth, panel, productos y categorías, proveedores, movimientos, alertas, reportes, usuarios y auditoría. Contrato en `frontend/API.md`.
- Cada acción (login, login fallido, logout, crear, editar, activar, desactivar, entradas, salidas, alertas y exportaciones) queda en `auditoria`.

## Frontend (React + Vite + TypeScript)

- Las 11 pantallas conectadas a la API real (8 del administrador, 3 del auxiliar, más el login). Se quitó la API simulada.
- Pantalla nueva **Mi actividad** para el auxiliar, y **Auditoría** con filtros y detalle de cambios para el administrador.

## Pendiente

- [ ] Ejecutar `database/schema.sql`, `datos_prueba.sql` y las pruebas P01 a P10 en SSMS, y guardar las capturas.
- [ ] Probar el backend contra SQL Server (paso 6 de `database/GUIA_SQL_SERVER.md`).
- [ ] Decidir en grupo cómo unir este backend con el del compañero.
- [ ] Prototipos: cambiar "Mecánico" por "Auxiliar de inventario" y agregar Auditoría y Mi actividad.
- [ ] Diagramas: C1 (nombre del actor), C2 (SQL Server), C3 (módulo Auditoría), C4 (clase Auditoria y rol).
- [ ] Modelos conceptual y lógico en Lucidchart: entidad Auditoria; modelo físico desde SSMS.
- [ ] Informe: rol, stack de base de datos, RF-13 (registro de auditoría) y diccionario de datos.
