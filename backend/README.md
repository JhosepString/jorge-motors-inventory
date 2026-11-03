# Backend — API REST

Node.js + Express 5 + TypeScript, con Prisma 7 sobre SQL Server. Validación con Zod, JWT con bcryptjs, helmet y CORS.

## Cómo ejecutarlo

Requisitos: Node.js 20.19 o superior, pnpm y la base `jorge_motors` creada en SQL Server (ver `database/GUIA_SQL_SERVER.md`).

```bash
cd backend
pnpm install            # también genera el cliente de Prisma
cp .env.example .env    # en Windows: copy .env.example .env  → completa DATABASE_URL y JWT_SECRET
pnpm dev
```

La API queda en http://localhost:3000/api/v1. Comprueba con http://localhost:3000/api/v1/salud (`"baseDeDatos": "ok"`).

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | `sqlserver://localhost:1433;database=jorge_motors;user=jorge_app;password=...;encrypt=true;trustServerCertificate=true` |
| `JWT_SECRET` | Texto largo y aleatorio (mínimo 16 caracteres) |
| `JWT_EXPIRA` | Duración del token, por ejemplo `8h` |
| `CORS_ORIGEN` | Dirección del frontend; varias separadas por coma |
| `ALERTAS_ENVIO_AUTOMATICO` | `true`: la alerta se envía sola al proveedor al generarse |

**Nunca ejecutes `prisma migrate` ni `prisma db push`.** La base se crea solo con `database/schema.sql`.

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor con recarga automática |
| `pnpm build` / `pnpm start` | Compila a `dist/` y lo ejecuta |
| `pnpm test` | Pruebas (patrones y cadena de middlewares) |
| `pnpm typecheck` | Revisa los tipos |

## Estructura

```
backend/
├── prisma/schema.prisma          # mismo modelo que database/schema.prisma
├── prisma.config.ts              # conexión de Prisma 7 (lee DATABASE_URL)
└── src/
    ├── server.ts / app.ts         # arranque, rutas /api/v1, suscriptores de eventos
    ├── config.ts                  # variables de entorno validadas con Zod
    ├── db/prisma.ts               # instancia única de PrismaClient
    ├── events/bus.ts              # bus de eventos (STOCK_ACTUALIZADO, ACCION_REGISTRADA)
    ├── middlewares/               # autenticar → permitir → validar → controlador → errores
    └── modules/
        ├── auth/                  # login, logout, me
        ├── productos/             # productos y categorías
        ├── proveedores/
        ├── inventario/            # InventarioFacade: salidas y entradas en una transacción
        ├── movimientos/
        ├── alertas/               # NotificadorStock, estados de la alerta y canales de aviso
        ├── reportes/              # inventario valorizado, kardex, CSV
        ├── usuarios/
        ├── panel/
        └── auditoria/             # suscriptor que guarda cada acción
```

## Dónde está cada patrón

| Patrón | Archivo |
| --- | --- |
| Singleton | `src/db/prisma.ts` |
| Facade | `src/modules/inventario/inventario.facade.ts` |
| Observer / Event-Driven | `src/events/bus.ts`, `alertas/notificador-stock.ts`, `auditoria/auditoria.service.ts` |
| State | `src/modules/alertas/estados.ts` |
| Strategy | `src/modules/alertas/canales.ts` |
| Chain of Responsibility / Pipe and Filter | `src/middlewares/` |
| Repository | Prisma Client en los servicios |

Los avisos a proveedores son simulados: el texto se guarda en la bandeja (`GET /alertas/bandeja`) y se imprime en la consola. Los endpoints están en `frontend/API.md`.
