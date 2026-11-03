import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { crearApp } from '../src/app.ts';

// Chain of Responsibility: estos filtros responden antes de tocar la base de datos
const app = crearApp();

describe('Cadena de filtros de la API', () => {
  it('rechaza las rutas protegidas sin token (filtro JWT → 401)', async () => {
    const r = await request(app).get('/api/v1/productos');
    expect(r.status).toBe(401);
    expect(r.body.mensaje).toMatch(/Inicia sesión/);
  });

  it('rechaza un token falso (401)', async () => {
    const r = await request(app).get('/api/v1/productos').set('Authorization', 'Bearer token-falso');
    expect(r.status).toBe(401);
    expect(r.body.mensaje).toMatch(/expiró/);
  });

  it('valida el cuerpo del login con Zod antes de consultar la base (400)', async () => {
    const r = await request(app).post('/api/v1/auth/login').send({ email: 'no-es-correo', password: '' });
    expect(r.status).toBe(400);
    expect(r.body.mensaje).toMatch(/email/);
  });

  it('responde 400 si el cuerpo no es JSON válido', async () => {
    const r = await request(app).post('/api/v1/auth/login').set('Content-Type', 'application/json').send('{malo');
    expect(r.status).toBe(400);
  });

  it('responde 404 con formato uniforme en rutas que no existen', async () => {
    const r = await request(app).get('/api/v1/no-existe');
    expect(r.status).toBe(401); // primero pasa por el filtro JWT
    const r2 = await request(app).get('/otra-ruta');
    expect(r2.status).toBe(404);
    expect(r2.body).toHaveProperty('mensaje');
  });

  it('agrega cabeceras de seguridad (helmet)', async () => {
    const r = await request(app).get('/otra-ruta');
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['x-powered-by']).toBeUndefined();
  });
});
