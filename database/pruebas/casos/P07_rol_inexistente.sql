-- P7. Crear un usuario con el rol antiguo MECANICO (ya no existe)
-- Resultado esperado: RECHAZADA por la restricción CHECK "ck_usuario_rol"
USE jorge_motors;
GO

INSERT INTO dbo.usuario (nombres, apellidos, email, password_hash, rol)
VALUES (N'X', N'Y', N'x@y.pe', N'hash', N'MECANICO');
GO
