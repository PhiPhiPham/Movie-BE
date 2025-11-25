import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureE2eApp } from './utils/setup-app';
import { login } from './utils/auth';

describe('SavedMoviesController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureE2eApp(app);
    await app.init();
    token = await login(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists saved movies for the current user', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/1/saved-movies')
      .query({ country: 'US' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  it('saves and removes a movie respecting duplicate rules', async () => {
    const savedResponse = await request(app.getHttpServer())
      .get('/users/1/saved-movies')
      .query({ country: 'US', pageSize: 50 })
      .set('Authorization', `Bearer ${token}`);
    const savedIds = new Set(savedResponse.body.data.map((movie: any) => movie.id));

    const moviesResponse = await request(app.getHttpServer())
      .get('/movies')
      .query({ country: 'US', pageSize: 50 });
    const targetMovie = moviesResponse.body.data.find(
      (movie: any) => !savedIds.has(movie.id),
    );

    expect(targetMovie).toBeDefined();

    const saveResponse = await request(app.getHttpServer())
      .post('/users/1/saved-movies')
      .set('Authorization', `Bearer ${token}`)
      .send({ movieId: targetMovie.id, country: 'US' });

    expect(saveResponse.status).toBe(201);
    expect(saveResponse.body.id).toBe(targetMovie.id);

    const duplicateResponse = await request(app.getHttpServer())
      .post('/users/1/saved-movies')
      .set('Authorization', `Bearer ${token}`)
      .send({ movieId: targetMovie.id, country: 'US' });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.error.code).toBe('DUPLICATE_SAVE');

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/users/1/saved-movies/${targetMovie.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(204);
  });
});
