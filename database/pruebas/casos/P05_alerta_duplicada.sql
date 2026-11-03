-- P5. Segunda alerta abierta para un producto que ya tiene una PENDIENTE
-- Resultado esperado: RECHAZADA por el índice único filtrado "uq_alerta_abierta_por_producto"
USE jorge_motors;
GO

INSERT INTO dbo.alerta_stock (producto_id, proveedor_id, stock_detectado, stock_minimo)
SELECT TOP 1 producto_id, proveedor_id, 0, 1 FROM dbo.alerta_stock WHERE estado = N'PENDIENTE';
GO

-- Comprobación: siguen siendo 4 alertas
SELECT COUNT(*) AS alertas FROM dbo.alerta_stock;
GO
