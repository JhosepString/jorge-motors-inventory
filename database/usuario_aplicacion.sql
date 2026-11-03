-- Usuario de SQL Server para el backend (ejecutar una sola vez, después de schema.sql)
-- Cambia la contraseña y usa la misma en DATABASE_URL del archivo .env
USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'jorge_app')
    CREATE LOGIN jorge_app WITH PASSWORD = N'8904180Asd', CHECK_POLICY = ON;
GO

USE jorge_motors;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'jorge_app')
    CREATE USER jorge_app FOR LOGIN jorge_app;
GO

ALTER ROLE db_datareader ADD MEMBER jorge_app;
ALTER ROLE db_datawriter ADD MEMBER jorge_app;
GO
