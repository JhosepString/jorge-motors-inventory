# Guía: base de datos en SQL Server — Jorge Motors

Esta guía crea la base `jorge_motors` en SQL Server con SSMS, ejecuta las pruebas de integridad y la conecta al backend con Prisma.

## 1. Instalar (una sola vez)

1. **SQL Server Express:** descárgalo de la página de Microsoft (busca "SQL Server Express download") y elige la instalación **Básica**. Al terminar anota el nombre de la instancia; normalmente es `SQLEXPRESS`.
2. **SSMS (SQL Server Management Studio):** descárgalo de la página de Microsoft e instálalo.

## 2. Conectarse en SSMS

1. Abre SSMS. En **Conectar al servidor**:
   - Nombre del servidor: `localhost\SQLEXPRESS`
   - Autenticación: **Autenticación de Windows**
   - Marca **Confiar en el certificado del servidor** (*Trust server certificate*).
2. **Conectar**.

## 3. Crear la base de datos

1. **Archivo → Abrir → Archivo** → `database/schema.sql`.
2. Pulsa **F5** (Ejecutar). El script crea la base `jorge_motors` y todo su contenido. Los `GO` separan los bloques; SSMS los entiende sin hacer nada más.
3. Al final aparece una tabla de comprobación:

| Objeto | Cantidad esperada |
| --- | --- |
| Tablas | 8 |
| Índices | 11 |
| Triggers | 7 |
| Vistas | 3 |

4. Abre `database/pruebas/datos_prueba.sql` y ejecútalo con **F5**. La comprobación final debe mostrar: usuario 3 · categoria 7 · proveedor 3 · producto 15 · stock 15 · movimiento 35 · alerta_stock 4 · auditoria 11.

Para ver la base: en el **Explorador de objetos**, clic derecho en **Bases de datos → Actualizar** y despliega `jorge_motors`.

## 4. Ejecutar las pruebas de integridad

Abre cada archivo de `database/pruebas/casos/` en orden y ejecútalo con **F5**.

- **P01** debe ejecutarse **una sola vez**: deja el stock de REP-0001 en 3 y crea su movimiento y su registro de auditoría.
- **P02 a P10** deben mostrar un **error en rojo**: ese es el resultado correcto. Los `GO` hacen que, después del error, se ejecute igual la consulta de comprobación.

| Prueba | Qué se intenta | Resultado esperado | Qué buscar en el mensaje | Qué protege |
| --- | --- | --- | --- | --- |
| P01 | Salida de 2 unidades en una transacción, con auditoría | **Se ejecuta**: stock 5 → 3 | — | RNF-04 (Facade) y auditoría |
| P02 | Dejar el stock en negativo | Rechazada | `ck_stock_cantidad` | RNF-04 |
| P03 | Movimiento descuadrado | Rechazada | `ck_movimiento_aritmetica` | RNF-04, RNF-06 |
| P04 | Editar y borrar un movimiento | Ambos rechazados | `Los movimientos son inmutables...` / `...no se pueden eliminar` | RNF-06 (kardex) |
| P05 | Segunda alerta abierta del mismo producto | Rechazada | `uq_alerta_abierta_por_producto` | Observer sin duplicados |
| P06 | Pasar una alerta de PENDIENTE a ATENDIDA | Rechazada | `Transición de estado de alerta no permitida` | State |
| P07 | Usuario con el rol antiguo MECANICO | Rechazada | `ck_usuario_rol` | RF-02 (roles) |
| P08 | Producto con categoría inexistente | Rechazada | `fk_producto_categoria` | Integridad referencial |
| P09 | Editar y borrar un registro de auditoría | Ambos rechazados | `Los registros de auditoría no se pueden...` | Auditoría inmutable |
| P10 | Auditoría con acción inventada y detalle que no es JSON | Ambos rechazados | `ck_auditoria_accion` / `ck_auditoria_json` | Auditoría confiable |

**Resultado final esperado: 10 de 10 pruebas con el resultado previsto (1 ejecutada y 9 rechazadas).**

Si SSMS está en español, el mensaje dirá algo como *"La instrucción UPDATE está en conflicto con la restricción CHECK "ck_stock_cantidad""*. Lo importante es el **nombre de la restricción** de la tabla.

Para repetir todo desde cero, vuelve a ejecutar `schema.sql` y `datos_prueba.sql`.

## 5. Preparar la conexión para el backend (una sola vez)

Prisma se conecta por red (TCP) y con usuario y contraseña de SQL Server, así que hay que activar dos cosas:

**a) Autenticación de SQL Server**
1. En SSMS, clic derecho sobre el servidor (arriba en el Explorador de objetos) → **Propiedades → Seguridad**.
2. Elige **Modo de autenticación de SQL Server y de Windows** → Aceptar.

**b) TCP/IP en el puerto 1433**
1. Abre **SQL Server Configuration Manager** (búscalo en el menú Inicio).
2. **Configuración de red de SQL Server → Protocolos de SQLEXPRESS → TCP/IP → Habilitar**.
3. Doble clic en **TCP/IP → pestaña Direcciones IP → sección IPAll**: borra *Puertos dinámicos TCP* y pon **1433** en *Puerto TCP*.
4. En **Servicios de SQL Server**, clic derecho en **SQL Server (SQLEXPRESS) → Reiniciar**.

**c) Usuario de la aplicación**
1. Abre `database/usuario_aplicacion.sql`, **cambia la contraseña** y ejecútalo con **F5**.
2. Crea el usuario `jorge_app` con permisos de lectura y escritura sobre `jorge_motors`, sin permisos de administrador.

## 6. Conectar el backend

El backend ya trae Prisma 7 configurado (`backend/prisma/schema.prisma` y `backend/prisma.config.ts`). En la carpeta `backend/`:

1. Copia `.env.example` a `.env` (el que **no** se sube a GitHub) y pon la contraseña de `jorge_app`:
   ```
   DATABASE_URL="sqlserver://localhost:1433;database=jorge_motors;user=jorge_app;password=TU_CONTRASEÑA;encrypt=true;trustServerCertificate=true"
   ```
2. Instala y genera el cliente:
   ```bash
   pnpm install
   ```
3. Enciende la API y comprueba la conexión:
   ```bash
   pnpm dev
   ```
   La consola debe mostrar *Conectado a SQL Server*, y http://localhost:3000/api/v1/salud debe responder `"baseDeDatos": "ok"`.

**Nunca ejecutes `prisma migrate` ni `prisma db push`:** borrarían las restricciones CHECK, el índice filtrado y los triggers. La base solo se crea o cambia con `schema.sql`.

En Prisma 7 la cadena de conexión no va en `schema.prisma`, sino en `prisma.config.ts`, y la conexión usa el adaptador `@prisma/adapter-mssql`.

## 7. Si algo no sale como se espera

| Problema | Causa y solución |
| --- | --- |
| SSMS no conecta: error de certificado | Marca **Confiar en el certificado del servidor** en la ventana de conexión. |
| "Ya existe un objeto denominado..." | Ejecutaste solo una parte. Ejecuta `schema.sql` **completo** con F5: al inicio borra todo. |
| P01 no muestra 5 al inicio | Ya ejecutaste P01 antes. Vuelve a ejecutar `schema.sql` y `datos_prueba.sql`. |
| Prisma: *Login failed for user 'jorge_app'* | Falta el modo de autenticación mixto (paso 5a), o la contraseña del `.env` no coincide. |
| Prisma: *Can't reach database server at localhost:1433* | TCP/IP no está habilitado o el puerto no es 1433 (paso 5b). Reinicia el servicio. |
| Error con *SET options ... QUOTED_IDENTIFIER* al insertar alertas | La sesión tiene `QUOTED_IDENTIFIER OFF`. En SSMS viene activado; si pasa desde otra herramienta, ejecuta `SET QUOTED_IDENTIFIER ON;` antes. |
| No se puede borrar un proveedor | Es intencional: los proveedores se **desactivan** (`activo = 0`), no se borran. |
