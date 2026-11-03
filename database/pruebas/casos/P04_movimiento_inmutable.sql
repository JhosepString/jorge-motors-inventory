-- P4. Editar o borrar un movimiento
-- Resultado esperado: AMBOS RECHAZADOS
--   UPDATE -> "Los movimientos son inmutables: registre un movimiento correctivo"
--   DELETE -> "Los movimientos no se pueden eliminar"
USE jorge_motors;
GO

UPDATE dbo.movimiento SET cantidad = 1 WHERE id = 1;
GO

DELETE FROM dbo.movimiento WHERE id = 1;
GO

-- Comprobación: el movimiento 1 sigue igual
SELECT id, tipo, cantidad, stock_anterior, stock_resultante FROM dbo.movimiento WHERE id = 1;
GO
