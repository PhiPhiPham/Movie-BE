import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function login(
  app: INestApplication,
  email = 'viewer1@movie.test',
  password = 'changeme',
) {
  const response = await request(app.getHttpServer()).post('/auth/login').send({
    email,
    password,
  });

  if (response.status !== 201 && response.status !== 200) {
    throw new Error(`Failed to login for tests: ${response.text}`);
  }

  return response.body.access_token as string;
}
