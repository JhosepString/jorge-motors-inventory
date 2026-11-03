-- Datos de prueba (ejecutar después de schema.sql)
-- Administrador: admin@jorgemotors.pe / Admin123*
-- Auxiliares de inventario: carlos.quispe@ y miguel.torres@jorgemotors.pe / Auxiliar123*
USE jorge_motors;
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- Usuarios
INSERT INTO dbo.usuario (nombres, apellidos, email, password_hash, rol) VALUES (N'Jorge Luis', N'Hernández Padilla', N'admin@jorgemotors.pe', N'$2b$10$7r4xQ/Gwgkgs9pd.8TT8fOSmaKj6sALvu7lQkmX1aMwxwv8mjQZOy', N'ADMINISTRADOR');
INSERT INTO dbo.usuario (nombres, apellidos, email, password_hash, rol) VALUES (N'Carlos', N'Quispe Ramos', N'carlos.quispe@jorgemotors.pe', N'$2b$10$tumkyVerk2UXWzUj/rEvk..8nmIbGQzsiMJDpakYOS5jHiZXHjOhu', N'AUXILIAR_INVENTARIO');
INSERT INTO dbo.usuario (nombres, apellidos, email, password_hash, rol) VALUES (N'Miguel', N'Torres Huamán', N'miguel.torres@jorgemotors.pe', N'$2b$10$tumkyVerk2UXWzUj/rEvk..8nmIbGQzsiMJDpakYOS5jHiZXHjOhu', N'AUXILIAR_INVENTARIO');

-- Categorías
INSERT INTO dbo.categoria (nombre, descripcion) VALUES (N'Repuestos', N'Piezas de motor, frenos, suspensión y transmisión');
INSERT INTO dbo.categoria (nombre, descripcion) VALUES (N'Lubricantes', N'Aceites de motor, caja y refrigerantes');
INSERT INTO dbo.categoria (nombre, descripcion) VALUES (N'Filtros', N'Filtros de aceite, aire, combustible y cabina');
INSERT INTO dbo.categoria (nombre, descripcion) VALUES (N'Baterías', N'Baterías de arranque para autos y camionetas');
INSERT INTO dbo.categoria (nombre, descripcion) VALUES (N'Herramientas', N'Herramientas manuales y de diagnóstico del taller');
INSERT INTO dbo.categoria (nombre, descripcion) VALUES (N'Accesorios', N'Accesorios eléctricos y de carrocería');
INSERT INTO dbo.categoria (nombre, descripcion) VALUES (N'Materiales de mantenimiento', N'Grasas, limpiadores, cintas y consumibles');

-- Proveedores
INSERT INTO dbo.proveedor (ruc, razon_social, contacto, telefono, email, direccion, ciudad, canal_preferido) VALUES (N'20601234561', N'Distribuidora Automotriz del Sur S.A.C.', N'Rosa Medina', N'956123401', N'ventas@dasur.pe', N'Av. Benavides 450', N'Chincha Alta', N'CORREO');
INSERT INTO dbo.proveedor (ruc, razon_social, contacto, telefono, email, direccion, ciudad, canal_preferido) VALUES (N'20512345672', N'Lubricantes Ica E.I.R.L.', N'Pedro Saravia', N'956123402', N'pedidos@lubica.pe', N'Calle Lima 120', N'Ica', N'WHATSAPP');
INSERT INTO dbo.proveedor (ruc, razon_social, contacto, telefono, email, direccion, ciudad, canal_preferido) VALUES (N'20498765433', N'Baterías y Eléctricos Pisco S.R.L.', N'Ana Cárdenas', N'956123403', NULL, N'Jr. Comercio 88', N'Pisco', N'SMS');

-- Productos
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'REP-0001', N'Pastillas de freno delanteras', N'Bosch', N'JUEGO', 85.00, 120.00, 4, 1, 1);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'REP-0002', N'Bujía de iridio', N'NGK', N'UNIDAD', 28.00, 40.00, 8, 1, 1);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'REP-0003', N'Faja de distribución', N'Gates', N'UNIDAD', 95.00, 140.00, 2, 1, 1);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'REP-0004', N'Amortiguador delantero', N'Monroe', N'UNIDAD', 160.00, 230.00, 2, 1, 1);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'LUB-0001', N'Aceite de motor 20W-50', N'Castrol', N'GALON', 75.00, 105.00, 6, 2, 2);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'LUB-0002', N'Aceite sintético 5W-30', N'Mobil', N'LITRO', 32.00, 45.00, 10, 2, 2);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'LUB-0003', N'Refrigerante verde', N'Prestone', N'GALON', 38.00, 55.00, 3, 2, 2);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'FIL-0001', N'Filtro de aceite', N'Wix', N'UNIDAD', 18.00, 28.00, 5, 3, 1);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'FIL-0002', N'Filtro de aire', N'Fram', N'UNIDAD', 30.00, 45.00, 4, 3, 1);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'FIL-0003', N'Filtro de combustible', N'Bosch', N'UNIDAD', 35.00, 50.00, 3, 3, 1);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'BAT-0001', N'Batería 13 placas 12V', N'Etna', N'UNIDAD', 280.00, 360.00, 2, 4, 3);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'BAT-0002', N'Batería 15 placas 12V', N'Capsa', N'UNIDAD', 330.00, 420.00, 2, 4, 3);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'HER-0001', N'Juego de llaves mixtas 8-22 mm', N'Stanley', N'JUEGO', 150.00, 0.00, 1, 5, NULL);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'ACC-0001', N'Foco H4 halógeno', N'Philips', N'UNIDAD', 22.00, 35.00, 6, 6, 3);
INSERT INTO dbo.producto (sku, nombre, marca, unidad_medida, precio_compra, precio_venta, stock_minimo, categoria_id, proveedor_id) VALUES (N'MAT-0001', N'Grasa multipropósito', N'Shell', N'KIT', 25.00, 38.00, 3, 7, 2);

-- Stock
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (1, 5, N'A-01');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (2, 16, N'A-02');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (3, 4, N'A-03');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (4, 1, N'A-04');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (5, 5, N'B-01');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (6, 16, N'B-02');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (7, 5, N'B-03');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (8, 9, N'C-01');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (9, 6, N'C-02');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (10, 2, N'C-03');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (11, 3, N'D-01');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (12, 1, N'D-02');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (13, 2, N'E-01');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (14, 8, N'F-01');
INSERT INTO dbo.stock (producto_id, cantidad_actual, ubicacion) VALUES (15, 4, N'G-01');

-- Movimientos
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (1, 1, N'ENTRADA', 10, 0, 10, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-02T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (1, 3, N'SALIDA', 3, 10, 7, N'Uso en servicio de mantenimiento', N'OT-103', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (1, 2, N'SALIDA', 2, 7, 5, N'Uso en servicio de mantenimiento', N'OT-104', '2026-10-11T15:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (2, 1, N'ENTRADA', 24, 0, 24, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-03T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (2, 2, N'SALIDA', 4, 24, 20, N'Uso en servicio de mantenimiento', N'OT-106', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (2, 3, N'SALIDA', 4, 20, 16, N'Uso en servicio de mantenimiento', N'OT-107', '2026-10-11T15:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (3, 1, N'ENTRADA', 5, 0, 5, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-04T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (3, 3, N'SALIDA', 1, 5, 4, N'Uso en servicio de mantenimiento', N'OT-109', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (4, 1, N'ENTRADA', 4, 0, 4, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-05T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (4, 2, N'SALIDA', 2, 4, 2, N'Uso en servicio de mantenimiento', N'OT-112', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (4, 3, N'SALIDA', 1, 2, 1, N'Uso en servicio de mantenimiento', N'OT-113', '2026-10-11T15:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (5, 1, N'ENTRADA', 12, 0, 12, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-06T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (5, 3, N'SALIDA', 3, 12, 9, N'Uso en servicio de mantenimiento', N'OT-115', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (5, 2, N'SALIDA', 2, 9, 7, N'Uso en servicio de mantenimiento', N'OT-116', '2026-10-11T15:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (5, 3, N'SALIDA', 2, 7, 5, N'Uso en servicio de mantenimiento', N'OT-117', '2026-10-12T16:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (6, 1, N'ENTRADA', 20, 0, 20, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-07T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (6, 2, N'SALIDA', 4, 20, 16, N'Uso en servicio de mantenimiento', N'OT-118', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (7, 1, N'ENTRADA', 6, 0, 6, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-08T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (7, 3, N'SALIDA', 1, 6, 5, N'Uso en servicio de mantenimiento', N'OT-121', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (8, 1, N'ENTRADA', 15, 0, 15, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-09T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (8, 2, N'SALIDA', 3, 15, 12, N'Uso en servicio de mantenimiento', N'OT-124', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (8, 3, N'SALIDA', 3, 12, 9, N'Uso en servicio de mantenimiento', N'OT-125', '2026-10-11T15:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (9, 1, N'ENTRADA', 8, 0, 8, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-01T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (9, 3, N'SALIDA', 2, 8, 6, N'Uso en servicio de mantenimiento', N'OT-127', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (10, 1, N'ENTRADA', 4, 0, 4, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-02T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (10, 2, N'SALIDA', 2, 4, 2, N'Uso en servicio de mantenimiento', N'OT-130', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (11, 1, N'ENTRADA', 4, 0, 4, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-03T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (11, 3, N'SALIDA', 1, 4, 3, N'Uso en servicio de mantenimiento', N'OT-133', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (12, 1, N'ENTRADA', 3, 0, 3, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-04T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (12, 2, N'SALIDA', 2, 3, 1, N'Uso en servicio de mantenimiento', N'OT-136', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (13, 1, N'ENTRADA', 2, 0, 2, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-05T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (14, 1, N'ENTRADA', 12, 0, 12, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-06T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (14, 2, N'SALIDA', 4, 12, 8, N'Uso en servicio de mantenimiento', N'OT-142', '2026-10-10T14:15:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (15, 1, N'ENTRADA', 6, 0, 6, N'Inventario inicial (migración desde Excel)', N'KARDEX-2026', '2026-10-07T13:30:00.000');
INSERT INTO dbo.movimiento (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_resultante, motivo, referencia, fecha) VALUES (15, 3, N'SALIDA', 2, 6, 4, N'Uso en servicio de mantenimiento', N'OT-145', '2026-10-10T14:15:00.000');

-- Alertas
INSERT INTO dbo.alerta_stock (producto_id, proveedor_id, stock_detectado, stock_minimo, estado, canal, fecha_generada, fecha_enviada, fecha_atendida) VALUES (4, 1, 1, 2, N'PENDIENTE', NULL, '2026-10-11T14:16:00.000', NULL, NULL);
INSERT INTO dbo.alerta_stock (producto_id, proveedor_id, stock_detectado, stock_minimo, estado, canal, fecha_generada, fecha_enviada, fecha_atendida) VALUES (5, 2, 5, 6, N'ENVIADA', N'WHATSAPP', '2026-10-11T14:16:00.000', '2026-10-11T15:00:00.000', NULL);
INSERT INTO dbo.alerta_stock (producto_id, proveedor_id, stock_detectado, stock_minimo, estado, canal, fecha_generada, fecha_enviada, fecha_atendida) VALUES (10, 1, 2, 3, N'PENDIENTE', NULL, '2026-10-11T14:16:00.000', NULL, NULL);
INSERT INTO dbo.alerta_stock (producto_id, proveedor_id, stock_detectado, stock_minimo, estado, canal, fecha_generada, fecha_enviada, fecha_atendida) VALUES (12, 3, 1, 2, N'ENVIADA', N'SMS', '2026-10-11T14:16:00.000', '2026-10-11T15:00:00.000', NULL);

-- Auditoría
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (1, N'ADMINISTRADOR', N'CREAR', N'USUARIO', 2, N'Alta del auxiliar de inventario Carlos Quispe Ramos', NULL, N'{"rol":"AUXILIAR_INVENTARIO"}', N'192.168.1.10', '2026-10-01T13:45:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (1, N'ADMINISTRADOR', N'CREAR', N'USUARIO', 3, N'Alta del auxiliar de inventario Miguel Torres Huamán', NULL, N'{"rol":"AUXILIAR_INVENTARIO"}', N'192.168.1.10', '2026-10-01T13:50:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (1, N'ADMINISTRADOR', N'CREAR', N'PROVEEDOR', 3, N'Registro del proveedor Baterías y Eléctricos Pisco S.R.L.', NULL, N'{"ruc":"20498765433","canal_preferido":"SMS"}', N'192.168.1.10', '2026-10-01T14:00:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (NULL, NULL, N'LOGIN_FALLIDO', N'SESION', NULL, N'Intento de inicio de sesión fallido con el correo carlos.q@gmail.com', NULL, NULL, N'192.168.1.23', '2026-10-10T13:58:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (3, N'AUXILIAR_INVENTARIO', N'LOGIN', N'SESION', NULL, N'Inicio de sesión', NULL, NULL, N'192.168.1.24', '2026-10-10T14:00:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (2, N'AUXILIAR_INVENTARIO', N'LOGIN', N'SESION', NULL, N'Inicio de sesión', NULL, NULL, N'192.168.1.23', '2026-10-10T14:05:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (3, N'AUXILIAR_INVENTARIO', N'REGISTRAR_SALIDA', N'MOVIMIENTO', 2, N'Salida de 3 unidades de REP-0001 (OT-103)', NULL, N'{"stock_anterior":10,"stock_resultante":7}', N'192.168.1.24', '2026-10-10T14:15:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (2, N'AUXILIAR_INVENTARIO', N'REGISTRAR_SALIDA', N'MOVIMIENTO', 5, N'Salida de 4 unidades de REP-0002 (OT-106)', NULL, N'{"stock_anterior":24,"stock_resultante":20}', N'192.168.1.23', '2026-10-10T14:15:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (1, N'ADMINISTRADOR', N'EDITAR', N'PRODUCTO', 5, N'Cambio del stock mínimo de LUB-0001', N'{"stock_minimo":4}', N'{"stock_minimo":6}', N'192.168.1.10', '2026-10-11T13:40:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (1, N'ADMINISTRADOR', N'ENVIAR_ALERTA', N'ALERTA_STOCK', 2, N'Alerta de LUB-0001 enviada por WhatsApp a Lubricantes Ica E.I.R.L.', N'{"estado":"PENDIENTE"}', N'{"estado":"ENVIADA","canal":"WHATSAPP"}', N'192.168.1.10', '2026-10-11T15:00:00.000');
INSERT INTO dbo.auditoria (usuario_id, rol, accion, entidad, entidad_id, descripcion, valor_anterior, valor_nuevo, ip, fecha) VALUES (1, N'ADMINISTRADOR', N'EXPORTAR_REPORTE', N'REPORTE', NULL, N'Exportación del kardex de LUB-0001 a PDF', NULL, NULL, N'192.168.1.10', '2026-10-12T17:00:00.000');

COMMIT;
GO

-- Comprobación: 3, 7, 3, 15, 15, 35, 4, 11
SELECT N'usuario' AS tabla, COUNT(*) AS registros FROM dbo.usuario
UNION ALL SELECT N'categoria', COUNT(*) FROM dbo.categoria
UNION ALL SELECT N'proveedor', COUNT(*) FROM dbo.proveedor
UNION ALL SELECT N'producto', COUNT(*) FROM dbo.producto
UNION ALL SELECT N'stock', COUNT(*) FROM dbo.stock
UNION ALL SELECT N'movimiento', COUNT(*) FROM dbo.movimiento
UNION ALL SELECT N'alerta_stock', COUNT(*) FROM dbo.alerta_stock
UNION ALL SELECT N'auditoria', COUNT(*) FROM dbo.auditoria;
GO
