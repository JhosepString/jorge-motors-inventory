-- P3. Movimiento descuadrado (SALIDA de 2 con stock 3 -> 3)
-- Resultado esperado: RECHAZADA por la restricción CHECK "ck_movimiento_aritmetica"
USE jorge_motors;
GO

INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante)
VALUES (1, 2, N'SALIDA', 2, 3, 3);
GO
