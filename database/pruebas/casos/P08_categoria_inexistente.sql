-- P8. Crear un producto con una categoría que no existe (id 99)
-- Resultado esperado: RECHAZADA por la clave foránea "fk_producto_categoria"
USE jorge_motors;
GO

INSERT INTO dbo.producto (sku, nombre, categoria_id) VALUES (N'ZZZ-0001', N'Prueba', 99);
GO
