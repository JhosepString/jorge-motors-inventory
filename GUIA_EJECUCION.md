# Guía para levantar el sistema en tu PC (Windows)

Tiempo aproximado la primera vez: 40 minutos (la mayor parte son instalaciones). Las siguientes veces: 1 minuto (paso 7).

## Parte A. Instalar programas (una sola vez)

| Programa | Dónde | Notas |
| --- | --- | --- |
| SQL Server Express | Página de Microsoft, "SQL Server Express download" | Instalación **Básica**. Anota el nombre de la instancia (normalmente `SQLEXPRESS`) |
| SSMS | Página de Microsoft, "SSMS download" | |
| Node.js | https://nodejs.org → versión **LTS** | Durante la instalación deja marcado "Add to PATH" |
| VS Code | https://code.visualstudio.com | Opcional, pero cómodo |

Luego abre **PowerShell** e instala pnpm:

```powershell
npm install -g pnpm@10
```

Comprueba que todo quedó instalado (cierra y vuelve a abrir PowerShell si algún comando no se reconoce):

```powershell
node -v     # v20.19 o superior
pnpm -v     # 10.x
```

> Si PowerShell dice que *la ejecución de scripts está deshabilitada*, ejecuta una vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y responde `S`.

## Parte B. Preparar SQL Server (una sola vez)

### 1. Activar el inicio de sesión con usuario y contraseña

1. Abre **SSMS** → Nombre del servidor: `localhost\SQLEXPRESS` → Autenticación de Windows → marca **Confiar en el certificado del servidor** → **Conectar**.
2. En el Explorador de objetos, clic derecho sobre el servidor (la primera línea) → **Propiedades** → **Seguridad**.
3. Elige **Modo de autenticación de SQL Server y de Windows** → **Aceptar**.

### 2. Abrir el puerto 1433

1. En el menú Inicio busca **SQL Server Configuration Manager** (o `SQLServerManager16.msc` / `SQLServerManager15.msc`).
2. **Configuración de red de SQL Server** → **Protocolos de SQLEXPRESS** → clic derecho en **TCP/IP** → **Habilitar**.
3. Doble clic en **TCP/IP** → pestaña **Direcciones IP** → baja hasta **IPAll**:
   - *Puertos dinámicos TCP*: **déjalo vacío** (borra el 0 si hay).
   - *Puerto TCP*: **1433**.
4. **Servicios de SQL Server** → clic derecho en **SQL Server (SQLEXPRESS)** → **Reiniciar**.

### 3. Crear la base de datos

En SSMS (**Archivo → Abrir → Archivo**), abre y ejecuta con **F5**, en este orden:

| Orden | Archivo | Qué debe salir al final |
| --- | --- | --- |
| 1 | `database/schema.sql` | Tablas 8 · Índices 11 · Triggers 7 · Vistas 3 |
| 2 | `database/pruebas/datos_prueba.sql` | usuario 3 · categoria 7 · proveedor 3 · producto 15 · stock 15 · movimiento 35 · alerta_stock 4 · auditoria 11 |
| 3 | `database/usuario_aplicacion.sql` | "Comandos completados correctamente" |

En el archivo 3, **antes de ejecutarlo**, cambia la contraseña `CambiaEstaClave_2026!` por una tuya. Reglas: mínimo 8 caracteres con mayúscula, minúscula, número y símbolo, y **sin** `;` ni `=` (rompen la cadena de conexión). Anótala: la usarás en el paso 4.

> Si ya habías corrido las pruebas P01–P10, vuelve a ejecutar `schema.sql` y `datos_prueba.sql` para empezar con los datos limpios (el archivo 3 no hace falta repetirlo).

## Parte C. Preparar el proyecto (una sola vez)

1. Descomprime el zip, por ejemplo en `C:\proyectos\jorge-motors`.
2. Abre esa carpeta en VS Code (**Archivo → Abrir carpeta**) y abre una terminal (**Terminal → Nueva terminal**).

### 4. Backend

```powershell
cd backend
pnpm install
Copy-Item .env.example .env
```

`pnpm install` descarga las librerías y genera el cliente de Prisma (necesita internet; tarda unos minutos la primera vez).

Abre `backend/.env` y cambia dos cosas:

```
DATABASE_URL="sqlserver://localhost:1433;database=jorge_motors;user=jorge_app;password=LA_CONTRASEÑA_DEL_PASO_3;encrypt=true;trustServerCertificate=true"
JWT_SECRET=escribe-aqui-una-frase-larga-cualquiera-2026
```

### 5. Frontend

En una **segunda terminal** (el botón **+** de la terminal de VS Code):

```powershell
cd frontend
pnpm install
Copy-Item .env.example .env
```

No hace falta cambiar nada en `frontend/.env`.

## Parte D. Encenderlo (cada vez que lo quieras usar)

### 6. Terminal 1: backend

```powershell
cd backend
pnpm dev
```

Debe mostrar:

```
API de Jorge Motors en http://localhost:3000/api/v1
Conectado a SQL Server
```

Comprueba en el navegador: http://localhost:3000/api/v1/salud → `"baseDeDatos":"ok"`.

### 7. Terminal 2: frontend

```powershell
cd frontend
pnpm dev
```

Abre http://localhost:5173.

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@jorgemotors.pe | Admin123* |
| Auxiliar de inventario | carlos.quispe@jorgemotors.pe | Auxiliar123* |
| Auxiliar de inventario | miguel.torres@jorgemotors.pe | Auxiliar123* |

Para apagar: **Ctrl + C** en cada terminal. SQL Server sigue encendido como servicio de Windows; no hay que abrir SSMS para usar el sistema.

## Prueba rápida para ver que todo funciona

1. Entra como **auxiliar** → Registrar salida → busca `REP-0003` (Faja de distribución) → 3 unidades → OT `OT-2026-0001` → Confirmar. Debe decir que se generó una alerta.
2. Cierra sesión y entra como **administrador**:
   - **Panel**: la salida aparece en Últimos movimientos.
   - **Alertas**: la alerta de REP-0003 aparece en *Enviadas* (se envió sola por correo; el texto está en la Bandeja de salida y en la terminal del backend).
   - **Auditoría**: aparece el ingreso del auxiliar, su salida y el envío de la alerta.
3. En SSMS puedes confirmarlo: `SELECT TOP 5 * FROM jorge_motors.dbo.movimiento ORDER BY id DESC;`

## Si algo falla

| Mensaje | Causa y solución |
| --- | --- |
| `pnpm` no se reconoce | Cierra y abre la terminal. Si sigue, repite `npm install -g pnpm@10` |
| En la terminal del backend: *Login failed for user 'jorge_app'* | La contraseña de `.env` no es la del paso 3, o falta el modo mixto (paso 1). Tras cambiar el modo, reinicia el servicio |
| *Failed to connect to localhost:1433* / *Could not connect* | TCP/IP no habilitado o puerto distinto de 1433 (paso 2). Reinicia el servicio después del cambio |
| *Cannot open database "jorge_motors"* | No se ejecutó `schema.sql`, o `usuario_aplicacion.sql` se ejecutó antes que él |
| *Configuración inválida en .env* al iniciar el backend | Falta `backend/.env` o `JWT_SECRET` tiene menos de 16 caracteres |
| *Cannot find module '../generated/prisma/client'* | En `backend/` ejecuta `pnpm exec prisma generate` |
| El login dice *No se pudo conectar con el servidor* | El backend no está encendido (paso 6) |
| El login dice *Correo o contraseña incorrectos* con los datos de la tabla | No se ejecutó `datos_prueba.sql` |
| *EADDRINUSE :3000* o el 5173 ocupado | Ya hay una copia encendida en otra terminal: ciérrala con Ctrl + C |
| Error de CORS en la consola del navegador | Abre la página en `http://localhost:5173` (no 127.0.0.1) o agrega esa dirección en `CORS_ORIGEN` del `.env` del backend |

**Nunca ejecutes `prisma migrate` ni `prisma db push`**: borrarían los triggers y restricciones de `schema.sql`.
