import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureE2eApp } from './utils/setup-app';

describe('GenresController (e2e)', () => {
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

  it('lists genres with pagination metadata', async () => {
    const response = await request(app.getHttpServer())
      .get('/genres')
      .query({ page: 1, pageSize: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      page: 1,
      page_size: 5,
    });
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeLessThanOrEqual(5);
  });
});
