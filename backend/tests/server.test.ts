import request from 'supertest';
import app from '../src/server';

describe('Server', () => {
  it('should return status OK on health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('should return welcome message on root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('sBTCPay API Server');
  });
});