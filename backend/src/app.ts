import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.ts';
import { prisma } from './db/prisma.ts';
import { eventos } from './events/bus.ts';
import { autenticar } from './middlewares/autenticar.ts';
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores.ts';
import { notificador, rutasAlertas } from './modules/alertas/alertas.rutas.ts';
import { rutasAuditoria } from './modules/auditoria/auditoria.rutas.ts';
import { suscribirAuditoria } from './modules/auditoria/auditoria.service.ts';
import { rutasAuth } from './modules/auth/auth.rutas.ts';
import { rutasMovimientos } from './modules/movimientos/movimientos.rutas.ts';
import { rutasPanel } from './modules/panel/panel.rutas.ts';
import { rutasCategorias, rutasProductos } from './modules/productos/productos.rutas.ts';
import { rutasProveedores } from './modules/proveedores/proveedores.rutas.ts';
import { rutasReportes } from './modules/reportes/reportes.rutas.ts';
import { rutasUsuarios } from './modules/usuarios/usuarios.rutas.ts';

let suscrito = false;

/** Suscriptores del bus de eventos (Observer): alertas de bajo stock y auditoría */
export function iniciarSuscriptores(): void {
  if (suscrito) return;
  notificador.suscribir(config.ALERTAS_ENVIO_AUTOMATICO);
  suscribirAuditoria(eventos);
  suscrito = true;
}

export function crearApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGEN.split(',').map((o) => o.trim()), exposedHeaders: ['Content-Disposition'] }));
  app.use(express.json({ limit: '100kb' }));

  const api = express.Router();

  // Health check (RNF-10): no exige sesión
  api.get('/salud', async (_req, res) => {
    const baseDeDatos = await prisma.$queryRaw`SELECT 1 AS ok`.then(() => 'ok').catch(() => 'sin conexión');
    res.json({ estado: 'ok', baseDeDatos, hora: new Date().toISOString() });
  });

  api.use('/auth', rutasAuth);

  // Desde aquí, toda ruta pasa por el filtro JWT (Chain of Responsibility)
  api.use(autenticar);
  api.use('/panel', rutasPanel);
  api.use('/categorias', rutasCategorias);
  api.use('/productos', rutasProductos);
  api.use('/proveedores', rutasProveedores);
  api.use('/movimientos', rutasMovimientos);
  api.use('/alertas', rutasAlertas);
  api.use('/reportes', rutasReportes);
  api.use('/usuarios', rutasUsuarios);
  api.use('/auditoria', rutasAuditoria);

  app.use('/api/v1', api);
  app.use(rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}
