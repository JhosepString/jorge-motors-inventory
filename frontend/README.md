# Frontend — SPA

React + Vite + TypeScript, con React Router. Diseñado para PC (1440 px), con los colores y tipografías de los prototipos (`docs/prototipos/`). Consume la API REST de `backend/`.

## Cómo ejecutarlo

Primero enciende el backend (ver `backend/README.md`). Luego:

```bash
cd frontend
pnpm install
cp .env.example .env    # en Windows: copy .env.example .env
pnpm dev
```

Abre http://localhost:5173. En `.env`, `VITE_API_URL` apunta a la API (por defecto `http://localhost:3000/api/v1`).

Usuarios de `database/pruebas/datos_prueba.sql`:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@jorgemotors.pe | Admin123* |
| Auxiliar de inventario | carlos.quispe@jorgemotors.pe | Auxiliar123* |

## Pantallas

| Rol | Ruta | Pantalla |
| --- | --- | --- |
| Ambos | `/login` | Inicio de sesión; cada rol entra a su inicio |
| Administrador | `/admin/panel` | Indicadores, últimos movimientos, alertas abiertas y unidades por categoría |
| | `/admin/productos` | Lista con filtros, crear / editar / activar productos, categorías |
| | `/admin/movimientos` | Registrar entradas y salidas con vista previa del stock; historial con filtros |
| | `/admin/alertas` | Tablero Pendientes / Enviadas / Atendidas y bandeja de avisos enviados |
| | `/admin/reportes` | Inventario valorizado y kardex; Excel (CSV) y PDF |
| | `/admin/proveedores` | Lista y formulario con canal de aviso (correo, SMS, WhatsApp) |
| | `/admin/usuarios` | Usuarios, roles, activar, cambiar contraseña y matriz de permisos |
| | `/admin/auditoria` | Registro de acciones con filtros, paginación y detalle antes / después |
| Auxiliar | `/auxiliar/salida` | Registrar salida en tres pasos con orden de trabajo |
| | `/auxiliar/stock` | Consultar stock (sin precios) |
| | `/auxiliar/actividad` | Mi actividad |

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con recarga automática |
| `pnpm build` | Revisa los tipos y genera la versión final en `dist/` |
| `pnpm preview` | Sirve la versión de `dist/` para probarla |
| `pnpm lint` | Revisa el código con oxlint |

## Estructura

```
src/
├── main.tsx              # arranque: fuentes, estilos, sesión y rutas
├── router.tsx            # rutas por rol (/admin/... y /auxiliar/...)
├── api/                  # cliente HTTP con JWT (http.ts), endpoints (index.ts) y tipos
├── auth/                 # sesión, contexto y ruta protegida por rol
├── layouts/Layout.tsx    # menú lateral según el rol
├── components/           # diálogo, tabla de auditoría, íconos, filtros
├── pages/admin/          # pantallas del administrador
├── pages/auxiliar/       # pantallas del auxiliar de inventario
├── utils/                # formatos (hora de Lima, soles), carga de datos y envíos
└── styles/global.css     # colores y medidas de los prototipos
```

Si el token vence o el usuario es desactivado, la API responde 401 y la app vuelve al login. Exportar a PDF usa el diálogo de impresión del navegador (estilos `@media print`).
