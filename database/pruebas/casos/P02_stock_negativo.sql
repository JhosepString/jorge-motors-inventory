-- P2. Dejar el stock en negativo
-- Resultado esperado: RECHAZADA por la restricción CHECK "ck_stock_cantidad"
USE jorge_motors;
GO

UPDATE dbo.stock SET cantidad_actual = cantidad_actual - 999 WHERE producto_id = 1;
GO

-- Comprobación: el stock no cambió
SELECT producto_id, cantidad_actual FROM dbo.stock WHERE producto_id = 1;
GO
