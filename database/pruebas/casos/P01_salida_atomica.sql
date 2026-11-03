-- P1. Salida de 2 unidades de REP-0001 (stock 5 -> 3), con su registro de auditoría
-- Resultado esperado: SE EJECUTA. Ejecutar todo el archivo con F5 UNA SOLA VEZ.
USE jorge_motors;
GO

-- Antes: cantidad_actual = 5
SELECT p.sku, p.nombre, s.cantidad_actual
FROM dbo.producto p JOIN dbo.stock s ON s.producto_id = p.id
WHERE p.id = 1;

SET XACT_ABORT ON;
BEGIN TRANSACTION;

UPDATE dbo.stock
SET cantidad_actual = cantidad_actual - 2, ultima_actualizacion = SYSUTCDATETIME()
WHERE producto_id = 1 AND cantidad_actual >= 2;

IF @@ROWCOUNT = 0
BEGIN
    ROLLBACK TRANSACTION;
    THROW 50010, N'Stock insuficiente', 1;
END;

INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia)
VALUES (1, 2, N'SALIDA', 2, 5, 3, N'Cambio de pastillas - prueba P1', N'OT-P1');

INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_nuevo)
VALUES (2, N'AUXILIAR_INVENTARIO', N'REGISTRAR_SALIDA', N'MOVIMIENTO', SCOPE_IDENTITY(),
        N'Salida de 2 unidades de REP-0001 (prueba P1)', N'{"stock_anterior":5,"stock_resultante":3}');

COMMIT TRANSACTION;

-- Después: cantidad_actual = 3
SELECT p.sku, p.nombre, s.cantidad_actual
FROM dbo.producto p JOIN dbo.stock s ON s.producto_id = p.id
WHERE p.id = 1;

-- Último movimiento y último registro de auditoría
SELECT TOP 1 * FROM dbo.v_kardex ORDER BY id DESC;
SELECT TOP 1 * FROM dbo.v_auditoria ORDER BY id DESC;
GO
