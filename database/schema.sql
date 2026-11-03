-- Base de datos: Sistema de inventario Jorge Motors (SQL Server)
-- Ejecutar completo en SSMS con F5.

IF DB_ID(N'jorge_motors') IS NULL
    CREATE DATABASE jorge_motors;
GO

USE jorge_motors;
GO

-- Borrado de objetos anteriores
DROP VIEW IF EXISTS dbo.v_auditoria;
DROP VIEW IF EXISTS dbo.v_kardex;
DROP VIEW IF EXISTS dbo.v_inventario;
DROP TABLE IF EXISTS dbo.auditoria;
DROP TABLE IF EXISTS dbo.alerta_stock;
DROP TABLE IF EXISTS dbo.movimiento;
DROP TABLE IF EXISTS dbo.stock;
DROP TABLE IF EXISTS dbo.producto;
DROP TABLE IF EXISTS dbo.proveedor;
DROP TABLE IF EXISTS dbo.categoria;
DROP TABLE IF EXISTS dbo.usuario;
GO

-- Tablas
CREATE TABLE dbo.usuario (
    id              INT IDENTITY(1,1) NOT NULL,
    nombres         NVARCHAR(100) NOT NULL,
    apellidos       NVARCHAR(100) NOT NULL,
    email           NVARCHAR(150) NOT NULL,
    password_hash   NVARCHAR(255) NOT NULL,
    rol             NVARCHAR(25)  NOT NULL CONSTRAINT df_usuario_rol DEFAULT N'AUXILIAR_INVENTARIO',
    activo          BIT           NOT NULL CONSTRAINT df_usuario_activo DEFAULT 1,
    creado_en       DATETIME2     NOT NULL CONSTRAINT df_usuario_creado_en DEFAULT SYSUTCDATETIME(),
    actualizado_en  DATETIME2     NOT NULL CONSTRAINT df_usuario_actualizado_en DEFAULT SYSUTCDATETIME(),
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_rol CHECK (rol IN (N'ADMINISTRADOR', N'AUXILIAR_INVENTARIO'))
);

CREATE TABLE dbo.categoria (
    id           INT IDENTITY(1,1) NOT NULL,
    nombre       NVARCHAR(80)  NOT NULL,
    descripcion  NVARCHAR(255) NULL,
    activo       BIT           NOT NULL CONSTRAINT df_categoria_activo DEFAULT 1,
    CONSTRAINT pk_categoria PRIMARY KEY (id),
    CONSTRAINT uq_categoria_nombre UNIQUE (nombre)
);

CREATE TABLE dbo.proveedor (
    id               INT IDENTITY(1,1) NOT NULL,
    ruc              CHAR(11)      NOT NULL,
    razon_social     NVARCHAR(150) NOT NULL,
    contacto         NVARCHAR(120) NULL,
    telefono         NVARCHAR(20)  NULL,
    email            NVARCHAR(150) NULL,
    direccion        NVARCHAR(200) NULL,
    ciudad           NVARCHAR(80)  NULL,
    canal_preferido  NVARCHAR(10)  NOT NULL CONSTRAINT df_proveedor_canal DEFAULT N'CORREO',
    activo           BIT           NOT NULL CONSTRAINT df_proveedor_activo DEFAULT 1,
    creado_en        DATETIME2     NOT NULL CONSTRAINT df_proveedor_creado_en DEFAULT SYSUTCDATETIME(),
    CONSTRAINT pk_proveedor PRIMARY KEY (id),
    CONSTRAINT uq_proveedor_ruc UNIQUE (ruc),
    CONSTRAINT ck_proveedor_ruc CHECK (LEN(ruc) = 11 AND ruc NOT LIKE '%[^0-9]%'),
    CONSTRAINT ck_proveedor_canal CHECK (canal_preferido IN (N'CORREO', N'SMS', N'WHATSAPP')),
    CONSTRAINT ck_proveedor_dato_canal CHECK (
        (canal_preferido = N'CORREO' AND email IS NOT NULL) OR
        (canal_preferido IN (N'SMS', N'WHATSAPP') AND telefono IS NOT NULL)
    )
);

CREATE TABLE dbo.producto (
    id              INT IDENTITY(1,1) NOT NULL,
    sku             NVARCHAR(20)  NOT NULL,
    nombre          NVARCHAR(150) NOT NULL,
    descripcion     NVARCHAR(500) NULL,
    marca           NVARCHAR(80)  NULL,
    unidad_medida   NVARCHAR(10)  NOT NULL CONSTRAINT df_producto_unidad DEFAULT N'UNIDAD',
    precio_compra   DECIMAL(10,2) NOT NULL CONSTRAINT df_producto_precio_compra DEFAULT 0,
    precio_venta    DECIMAL(10,2) NOT NULL CONSTRAINT df_producto_precio_venta DEFAULT 0,
    stock_minimo    INT           NOT NULL CONSTRAINT df_producto_stock_minimo DEFAULT 0,
    categoria_id    INT           NOT NULL,
    proveedor_id    INT           NULL,
    activo          BIT           NOT NULL CONSTRAINT df_producto_activo DEFAULT 1,
    creado_en       DATETIME2     NOT NULL CONSTRAINT df_producto_creado_en DEFAULT SYSUTCDATETIME(),
    actualizado_en  DATETIME2     NOT NULL CONSTRAINT df_producto_actualizado_en DEFAULT SYSUTCDATETIME(),
    CONSTRAINT pk_producto PRIMARY KEY (id),
    CONSTRAINT uq_producto_sku UNIQUE (sku),
    CONSTRAINT ck_producto_unidad CHECK (unidad_medida IN (N'UNIDAD', N'LITRO', N'GALON', N'JUEGO', N'KIT', N'METRO', N'CAJA')),
    CONSTRAINT ck_producto_precio_compra CHECK (precio_compra >= 0),
    CONSTRAINT ck_producto_precio_venta CHECK (precio_venta >= 0),
    CONSTRAINT ck_producto_stock_minimo CHECK (stock_minimo >= 0),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id)
        REFERENCES dbo.categoria (id) ON DELETE NO ACTION,
    CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedor_id)
        REFERENCES dbo.proveedor (id) ON DELETE SET NULL
);

CREATE TABLE dbo.stock (
    id                    INT IDENTITY(1,1) NOT NULL,
    producto_id           INT          NOT NULL,
    cantidad_actual       INT          NOT NULL CONSTRAINT df_stock_cantidad DEFAULT 0,
    ubicacion             NVARCHAR(20) NULL,
    ultima_actualizacion  DATETIME2    NOT NULL CONSTRAINT df_stock_actualizacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT pk_stock PRIMARY KEY (id),
    CONSTRAINT uq_stock_producto UNIQUE (producto_id),
    CONSTRAINT ck_stock_cantidad CHECK (cantidad_actual >= 0),
    CONSTRAINT fk_stock_producto FOREIGN KEY (producto_id)
        REFERENCES dbo.producto (id) ON DELETE CASCADE
);

CREATE TABLE dbo.movimiento (
    id                INT IDENTITY(1,1) NOT NULL,
    producto_id       INT           NOT NULL,
    usuario_id        INT           NOT NULL,
    tipo              NVARCHAR(10)  NOT NULL,
    cantidad          INT           NOT NULL,
    stock_anterior    INT           NOT NULL,
    stock_resultante  INT           NOT NULL,
    motivo            NVARCHAR(200) NULL,
    referencia        NVARCHAR(50)  NULL,
    fecha             DATETIME2     NOT NULL CONSTRAINT df_movimiento_fecha DEFAULT SYSUTCDATETIME(),
    CONSTRAINT pk_movimiento PRIMARY KEY (id),
    CONSTRAINT ck_movimiento_tipo CHECK (tipo IN (N'ENTRADA', N'SALIDA')),
    CONSTRAINT ck_movimiento_cantidad CHECK (cantidad > 0),
    CONSTRAINT ck_movimiento_stocks CHECK (stock_anterior >= 0 AND stock_resultante >= 0),
    CONSTRAINT ck_movimiento_aritmetica CHECK (
        (tipo = N'ENTRADA' AND stock_resultante = stock_anterior + cantidad) OR
        (tipo = N'SALIDA'  AND stock_resultante = stock_anterior - cantidad)
    ),
    CONSTRAINT fk_movimiento_producto FOREIGN KEY (producto_id)
        REFERENCES dbo.producto (id) ON DELETE NO ACTION,
    CONSTRAINT fk_movimiento_usuario FOREIGN KEY (usuario_id)
        REFERENCES dbo.usuario (id) ON DELETE NO ACTION
);

CREATE TABLE dbo.alerta_stock (
    id               INT IDENTITY(1,1) NOT NULL,
    producto_id      INT          NOT NULL,
    proveedor_id     INT          NULL,
    stock_detectado  INT          NOT NULL,
    stock_minimo     INT          NOT NULL,
    estado           NVARCHAR(10) NOT NULL CONSTRAINT df_alerta_estado DEFAULT N'PENDIENTE',
    canal            NVARCHAR(10) NULL,
    fecha_generada   DATETIME2    NOT NULL CONSTRAINT df_alerta_fecha_generada DEFAULT SYSUTCDATETIME(),
    fecha_enviada    DATETIME2    NULL,
    fecha_atendida   DATETIME2    NULL,
    CONSTRAINT pk_alerta_stock PRIMARY KEY (id),
    CONSTRAINT ck_alerta_stocks CHECK (stock_detectado >= 0 AND stock_minimo >= 0),
    CONSTRAINT ck_alerta_estado CHECK (estado IN (N'PENDIENTE', N'ENVIADA', N'ATENDIDA')),
    CONSTRAINT ck_alerta_canal CHECK (canal IN (N'CORREO', N'SMS', N'WHATSAPP')),
    CONSTRAINT ck_alerta_enviada CHECK (estado <> N'ENVIADA' OR (fecha_enviada IS NOT NULL AND canal IS NOT NULL)),
    CONSTRAINT ck_alerta_atendida CHECK (estado <> N'ATENDIDA' OR fecha_atendida IS NOT NULL),
    CONSTRAINT fk_alerta_producto FOREIGN KEY (producto_id)
        REFERENCES dbo.producto (id) ON DELETE CASCADE,
    CONSTRAINT fk_alerta_proveedor FOREIGN KEY (proveedor_id)
        REFERENCES dbo.proveedor (id) ON DELETE NO ACTION
);

CREATE TABLE dbo.auditoria (
    id              BIGINT IDENTITY(1,1) NOT NULL,
    usuario_id      INT           NULL,
    rol             NVARCHAR(25)  NULL,
    accion          NVARCHAR(30)  NOT NULL,
    entidad         NVARCHAR(30)  NOT NULL,
    entidad_id      INT           NULL,
    descripcion     NVARCHAR(300) NOT NULL,
    valor_anterior  NVARCHAR(MAX) NULL,
    valor_nuevo     NVARCHAR(MAX) NULL,
    ip              NVARCHAR(45)  NULL,
    fecha           DATETIME2     NOT NULL CONSTRAINT df_auditoria_fecha DEFAULT SYSUTCDATETIME(),
    CONSTRAINT pk_auditoria PRIMARY KEY (id),
    CONSTRAINT ck_auditoria_accion CHECK (accion IN (
        N'LOGIN', N'LOGIN_FALLIDO', N'LOGOUT',
        N'CREAR', N'EDITAR', N'DESACTIVAR', N'ACTIVAR',
        N'REGISTRAR_ENTRADA', N'REGISTRAR_SALIDA',
        N'ENVIAR_ALERTA', N'ATENDER_ALERTA', N'EXPORTAR_REPORTE')),
    CONSTRAINT ck_auditoria_entidad CHECK (entidad IN (
        N'SESION', N'USUARIO', N'CATEGORIA', N'PROVEEDOR', N'PRODUCTO',
        N'STOCK', N'MOVIMIENTO', N'ALERTA_STOCK', N'REPORTE')),
    CONSTRAINT ck_auditoria_rol CHECK (rol IN (N'ADMINISTRADOR', N'AUXILIAR_INVENTARIO')),
    CONSTRAINT ck_auditoria_json CHECK (
        (valor_anterior IS NULL OR ISJSON(valor_anterior) = 1) AND
        (valor_nuevo    IS NULL OR ISJSON(valor_nuevo)    = 1)
    ),
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id)
        REFERENCES dbo.usuario (id) ON DELETE NO ACTION
);
GO

-- Índices
CREATE INDEX idx_producto_categoria ON dbo.producto (categoria_id);
CREATE INDEX idx_producto_proveedor ON dbo.producto (proveedor_id);
CREATE INDEX idx_producto_nombre ON dbo.producto (nombre);

CREATE INDEX idx_movimiento_producto_fecha ON dbo.movimiento (producto_id, fecha);
CREATE INDEX idx_movimiento_usuario ON dbo.movimiento (usuario_id);
CREATE INDEX idx_movimiento_fecha ON dbo.movimiento (fecha);

CREATE UNIQUE INDEX uq_alerta_abierta_por_producto
    ON dbo.alerta_stock (producto_id)
    WHERE estado IN (N'PENDIENTE', N'ENVIADA');
CREATE INDEX idx_alerta_estado ON dbo.alerta_stock (estado);

CREATE INDEX idx_auditoria_fecha ON dbo.auditoria (fecha);
CREATE INDEX idx_auditoria_usuario_fecha ON dbo.auditoria (usuario_id, fecha);
CREATE INDEX idx_auditoria_entidad ON dbo.auditoria (entidad, entidad_id);
GO

-- Triggers
CREATE TRIGGER dbo.trg_movimiento_no_update ON dbo.movimiento
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    THROW 50001, N'Los movimientos son inmutables: registre un movimiento correctivo', 1;
END;
GO

CREATE TRIGGER dbo.trg_movimiento_no_delete ON dbo.movimiento
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    THROW 50002, N'Los movimientos no se pueden eliminar', 1;
END;
GO

CREATE TRIGGER dbo.trg_alerta_transicion ON dbo.alerta_stock
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(estado) AND EXISTS (
        SELECT 1
        FROM inserted i
        JOIN deleted d ON d.id = i.id
        WHERE NOT (
               i.estado = d.estado
            OR (d.estado = N'PENDIENTE' AND i.estado = N'ENVIADA')
            OR (d.estado = N'ENVIADA'   AND i.estado = N'ATENDIDA')
        )
    )
    BEGIN
        THROW 50003, N'Transición de estado de alerta no permitida', 1;
    END;
END;
GO

CREATE TRIGGER dbo.trg_usuario_actualizado ON dbo.usuario
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(actualizado_en)
    BEGIN
        UPDATE u SET actualizado_en = SYSUTCDATETIME()
        FROM dbo.usuario u
        JOIN inserted i ON i.id = u.id;
    END;
END;
GO

CREATE TRIGGER dbo.trg_producto_actualizado ON dbo.producto
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(actualizado_en)
    BEGIN
        UPDATE p SET actualizado_en = SYSUTCDATETIME()
        FROM dbo.producto p
        JOIN inserted i ON i.id = p.id;
    END;
END;
GO

CREATE TRIGGER dbo.trg_auditoria_no_update ON dbo.auditoria
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    THROW 50004, N'Los registros de auditoría no se pueden modificar', 1;
END;
GO

CREATE TRIGGER dbo.trg_auditoria_no_delete ON dbo.auditoria
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    THROW 50005, N'Los registros de auditoría no se pueden eliminar', 1;
END;
GO

-- Vistas
CREATE VIEW dbo.v_inventario AS
SELECT  p.id            AS producto_id,
        p.sku,
        p.nombre,
        c.nombre        AS categoria,
        pr.razon_social AS proveedor,
        s.cantidad_actual,
        p.stock_minimo,
        s.ubicacion,
        p.precio_compra,
        CAST(s.cantidad_actual * p.precio_compra AS DECIMAL(12,2)) AS valor_inventario,
        CASE
            WHEN s.cantidad_actual = 0              THEN N'AGOTADO'
            WHEN s.cantidad_actual < p.stock_minimo THEN N'CRITICO'
            ELSE N'NORMAL'
        END             AS estado_stock
FROM    dbo.producto p
JOIN    dbo.categoria c ON c.id = p.categoria_id
JOIN    dbo.stock s ON s.producto_id = p.id
LEFT JOIN dbo.proveedor pr ON pr.id = p.proveedor_id
WHERE   p.activo = 1;
GO

CREATE VIEW dbo.v_kardex AS
SELECT  m.id,
        m.fecha,
        p.sku,
        p.nombre AS producto,
        m.tipo,
        m.cantidad,
        m.stock_anterior,
        m.stock_resultante,
        m.motivo,
        m.referencia,
        CONCAT(u.nombres, N' ', u.apellidos) AS registrado_por,
        u.rol
FROM    dbo.movimiento m
JOIN    dbo.producto p ON p.id = m.producto_id
JOIN    dbo.usuario u ON u.id = m.usuario_id;
GO

CREATE VIEW dbo.v_auditoria AS
SELECT  a.id,
        a.fecha,
        CASE WHEN u.id IS NULL THEN N'(sin sesión)'
             ELSE CONCAT(u.nombres, N' ', u.apellidos) END AS usuario,
        a.rol,
        a.accion,
        a.entidad,
        a.entidad_id,
        a.descripcion,
        a.valor_anterior,
        a.valor_nuevo,
        a.ip
FROM    dbo.auditoria a
LEFT JOIN dbo.usuario u ON u.id = a.usuario_id;
GO

-- Comprobación: 8 tablas, 11 índices, 7 triggers, 3 vistas
SELECT N'Tablas' AS objeto, COUNT(*) AS cantidad FROM sys.tables WHERE is_ms_shipped = 0
UNION ALL
SELECT N'Índices', COUNT(*) FROM sys.indexes i JOIN sys.tables t ON t.object_id = i.object_id
WHERE i.is_primary_key = 0 AND i.is_unique_constraint = 0 AND i.type > 0 AND i.name IS NOT NULL
UNION ALL
SELECT N'Triggers', COUNT(*) FROM sys.triggers WHERE parent_class = 1
UNION ALL
SELECT N'Vistas', COUNT(*) FROM sys.views WHERE is_ms_shipped = 0;
GO
