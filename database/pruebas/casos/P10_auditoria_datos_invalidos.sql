-- P10. Registrar auditoría con una acción que no existe y con un detalle que no es JSON
-- Resultado esperado: AMBOS RECHAZADOS
--   Primer INSERT  -> restricción CHECK "ck_auditoria_accion"
--   Segundo INSERT -> restricción CHECK "ck_auditoria_json"
USE jorge_motors;
GO

INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, descripcion)
VALUES (1, N'ADMINISTRADOR', N'BORRAR_TODO', N'PRODUCTO', N'Acción inventada');
GO

INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_nuevo)
VALUES (1, N'ADMINISTRADOR', N'EDITAR', N'PRODUCTO', 1, N'Detalle mal formado', N'stock_minimo = 6');
GO
