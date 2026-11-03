-- P9. Editar o borrar un registro de auditoría
-- Resultado esperado: AMBOS RECHAZADOS
--   UPDATE -> "Los registros de auditoría no se pueden modificar"
--   DELETE -> "Los registros de auditoría no se pueden eliminar"
USE jorge_motors;
GO

UPDATE dbo.auditoria SET descripcion = N'Cambiado' WHERE id = 1;
GO

DELETE FROM dbo.auditoria WHERE id = 1;
GO

-- Comprobación: el registro 1 sigue igual
SELECT id, accion, entidad, descripcion FROM dbo.auditoria WHERE id = 1;
GO
