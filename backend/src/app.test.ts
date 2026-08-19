/**
 * Integration test over the Express app: health check and auth gate.
 */
import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { app } from './app.js';

describe('App', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'barber-shop-api' });
  });

  it('GET /api/auth/me requires a bearer token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/servicios requires a bearer token', async () => {
    const res = await request(app).get('/api/servicios');
    expect(res.status).toBe(401);
  });

  it('serves security headers via helmet', async () => {
    const res = await request(app).get('/api/servicios');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
  });
});