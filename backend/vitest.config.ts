import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      DATABASE_URL: 'sqlserver://localhost:1433;database=jorge_motors_test;user=sa;password=x;encrypt=true;trustServerCertificate=true',
      JWT_SECRET: 'clave-solo-para-pruebas-automaticas',
      ALERTAS_ENVIO_AUTOMATICO: 'false',
    },
  },
});
