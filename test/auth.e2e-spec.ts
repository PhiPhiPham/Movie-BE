import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureE2eApp } from './utils/setup-app';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureE2eApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in with seeded credentials', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'viewer1@movie.test',
      password: 'changeme',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
  });

  it('rejects invalid password', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'viewer1@movie.test',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTH_INVALID');
  });
});
