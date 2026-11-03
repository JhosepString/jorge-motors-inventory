import { crearApp, iniciarSuscriptores } from './app.ts';
import { config } from './config.ts';
import { prisma } from './db/prisma.ts';

iniciarSuscriptores();
const app = crearApp();

const servidor = app.listen(config.PORT, () => {
  console.log(`API de Jorge Motors en http://localhost:${config.PORT}/api/v1`);
  console.log(`Envío automático de alertas: ${config.ALERTAS_ENVIO_AUTOMATICO ? 'activado' : 'desactivado'}`);
});

prisma.$connect()
  .then(() => console.log('Conectado a SQL Server'))
  .catch((e: unknown) => console.error('No se pudo conectar a la base de datos. Revisa DATABASE_URL en .env:', e instanceof Error ? e.message : e));

// RNF-11: un error no controlado se registra, pero no tumba el servidor
process.on('unhandledRejection', (motivo) => console.error('[unhandledRejection]', motivo));

const cerrar = () => servidor.close(() => prisma.$disconnect().finally(() => process.exit(0)));
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
