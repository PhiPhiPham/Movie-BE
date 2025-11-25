import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureE2eApp } from './utils/setup-app';

describe('MoviesController (e2e)', () => {
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

  it('lists movies filtered by country', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies')
      .query({ country: 'US', page: 1, pageSize: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.length).toBeLessThanOrEqual(10);
    const movie = response.body.data[0];
    expect(movie).toHaveProperty('id');
    expect(movie).toHaveProperty('title');
    expect(movie).toHaveProperty('year');
  });
});
