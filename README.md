# Sistema de Gestión de Inventario "Jorge Motors"

Plataforma web para gestionar el inventario de la mecánica automotriz **Jorge Motors** (Pueblo Nuevo, Chincha, Ica). Reemplaza el control en hojas de Excel por un sistema que actualiza el stock en cada entrada o salida, guarda el historial de movimientos y avisa automáticamente al proveedor cuando un repuesto queda por debajo de su stock mínimo.

Proyecto del curso **Arquitectura de Software** — Universidad Nacional de Cañete.
Docente: Mg. Luis Enrique Ramírez Pacheco.

## Integrantes

- Castillo Canales, Korayma Anaís
- Hernández Hernández, José Antonio
- Alvarez Nia Elizabeth
- Rojas Castillo, Sebastián Jaren

## Roles

- **Administrador:** gestiona usuarios, productos, proveedores, alertas, reportes y la auditoría.
- **Auxiliar de inventario:** registra salidas de repuestos y consulta el stock.

Todas las acciones importantes quedan en el registro de **auditoría**.

## Arquitectura

- **Estilo:** monolito modular con arquitectura en capas (presentación → negocio → datos).
- **Modelado:** modelo C4 en cuatro niveles (contexto, contenedores, componentes y código).
- **Patrones GoF:** Singleton, Facade, Observer, Strategy, State y Chain of Responsibility.
- **Patrones arquitectónicos:** capas, cliente-servidor / API REST, Repository, Event-Driven y Pipe and Filter.

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Persistencia | Prisma ORM |
| Base de datos | SQL Server (local con SSMS; Azure SQL Database en la nube) |
| Seguridad | JWT, bcryptjs, Zod, CORS |

| Herramientas de diseño | Uso |
| --- | --- |
| draw.io | Arquitectura en capas, modelo C4 y mapa de navegación |
| Lucidchart | Modelos conceptual y lógico de la base de datos |
| SQL Server Management Studio (SSMS) | Ejecución del script SQL, pruebas y modelo físico |
| Figma | Prototipos de la interfaz |

## Estructura del repositorio

```
jorge-motors/
├── database/
│   ├── schema.sql                  # diseño físico de la base de datos (SQL Server)
│   ├── usuario_aplicacion.sql      # usuario de SQL Server para el backend
│   ├── schema.prisma               # esquema de Prisma (provider sqlserver)
│   ├── pruebas/
│   │   ├── datos_prueba.sql        # datos de ejemplo (15 productos, 4 alertas, kardex y auditoría)
│   │   └── casos/                  # pruebas de integridad P01 a P10
│   ├── sqlite_avance2/             # versión SQLite del Avance 2 (historial)
│   ├── GUIA_SQL_SERVER.md          # instalación, ejecución en SSMS y conexión con Prisma
│   └── README.md
├── docs/
│   ├── informe/                    # informe y exposición del Avance 2
│   ├── diagramas/                  # capas, C4 (niveles 1–4) y navegación (.drawio + .png)
│   ├── modelos/                    # modelos de la base de datos
│   └── prototipos/                 # pantallas de la interfaz (PC, 1440 px)
├── backend/                        # API REST: Express + Prisma (ver backend/README.md)
└── frontend/                       # SPA React (ver frontend/README.md)
```

## Estado del avance

| Fase | Periodo | Estado |
| --- | --- | --- |
| 1. Análisis y planificación | 20/08 – 17/09 | Completada |
| 2. Diseño: requerimientos, arquitectura, patrones, C4, base de datos y prototipos | 17/09 – 15/10 | Completada (Avance 2) |
| 3. Desarrollo e integración del backend y el frontend | 15/10 – 11/11 | En curso (rama `jose`: API y 11 pantallas) |
| 4. Pruebas funcionales | 12/11 – 25/11 | Pendiente |

## Cómo ejecutar el sistema completo

1. **Base de datos** (SSMS, conectado a `localhost\SQLEXPRESS`): ejecuta con **F5**, en este orden, `database/schema.sql`, `database/pruebas/datos_prueba.sql` y `database/usuario_aplicacion.sql` (cambia antes la contraseña). Activa la autenticación mixta y TCP 1433 como indica `database/GUIA_SQL_SERVER.md`, paso 5.
2. **Backend:**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env    # completa DATABASE_URL y JWT_SECRET
   pnpm dev                # http://localhost:3000/api/v1
   ```
3. **Frontend** (en otra terminal):
   ```bash
   cd frontend
   pnpm install
   cp .env.example .env
   pnpm dev                # http://localhost:5173
   ```
4. Ingresa con `admin@jorgemotors.pe` / `Admin123*` (administrador) o `carlos.quispe@jorgemotors.pe` / `Auxiliar123*` (auxiliar de inventario).

Resultado esperado de la base: 8 tablas, 11 índices, 7 triggers y 3 vistas. Las pruebas de integridad P01 a P10 están en `database/pruebas/casos/`.

## Forma de trabajo

- Cada integrante trabaja en su propia rama (`feature/<tema>`).
- Los cambios se integran a `main` mediante Pull Request revisado por otro integrante.
