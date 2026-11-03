-- P6. Pasar una alerta de PENDIENTE a ATENDIDA sin enviarla (patrón State)
-- Resultado esperado: RECHAZADA -> "Transición de estado de alerta no permitida"
USE jorge_motors;
GO

UPDATE dbo.alerta_stock
SET estado = N'ATENDIDA', fecha_atendida = SYSUTCDATETIME()
WHERE estado = N'PENDIENTE';
GO

-- Comprobación: las alertas pendientes siguen PENDIENTE
SELECT id, producto_id, estado FROM dbo.alerta_stock;
GO
