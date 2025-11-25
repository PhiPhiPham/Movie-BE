# Movie Discovery Service

Backend take-home project implemented with NestJS, Prisma, and PostgreSQL.

## Features

- REST APIs for listing genres/movies, managing saved movies, and authentication (JWT).
- Prisma schema, SQL migration, and deterministic seed script (~160 movies).
- Global pagination contract, ISO country validation, and consistent error envelope.
- OpenAPI 3 docs (`/docs` via Swagger UI, `openapi.yaml` checked in).
- Docker Compose + Makefile for one-command local/dev/prod builds.
- Comprehensive tests: unit coverage for business rules plus Supertest-powered e2e suites.

## Tech Stack

- Node.js 20, NestJS 11, TypeScript
- PostgreSQL 15, Prisma ORM
- Passport JWT authentication + bcrypt hashing

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy env template**
   ```bash
   cp .env.example .env
   ```
3. **Start Postgres & API (one command)**
   ```bash
   docker compose up --build
   ```
   This runs migrations automatically (`prisma migrate deploy`) and starts the API on `http://localhost:3000`.
4. **Seed data (optional outside Compose)**
   ```bash
   npm run seed
   ```

### Manual workflow (without Docker)

```bash
brew services start postgresql # or any Postgres instance
export DATABASE_URL="postgresql://user:pass@localhost:5432/movies?schema=public"
npm run prisma:migrate
npm run seed
npm run start:dev
```

## Authentication

- Endpoint: `POST /auth/login`
- Seed credential: `viewer1@movie.test` / `changeme`
- Include bearer token in subsequent requests: `Authorization: Bearer <token>`

## API Overview

| Endpoint | Description |
|----------|-------------|
| `GET /genres` | Paginated genres list |
| `GET /movies?country=US&genre=1&sort=-year&page=1&pageSize=20` | Movies available in a country |
| `GET /users/{userId}/saved-movies?country=US` | User's saved titles (requires JWT) |
| `POST /users/{userId}/saved-movies` | Save a movie (`{ "movieId": 10, "country": "US" }`) |
| `DELETE /users/{userId}/saved-movies/{movieId}` | Remove saved movie |

Responses follow `{ data, page, page_size, total }` for lists and `{ error: { code, message, details } }` for errors. Country parameters use ISO-3166-1 alpha-2.

### Docs

- Swagger UI: `http://localhost:3000/docs`
- Static spec: [`openapi.yaml`](openapi.yaml)

## Testing

All unit and e2e suites rely on a migrated + seeded Postgres instance.

```bash
npm run test          # unit tests (business rules)
npm run test:e2e      # Supertest flows (requires DATABASE_URL + seeded DB)
```

## Project Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Hot-reload dev server |
| `npm run build` | Compile TypeScript |
| `npm run prisma:migrate` | Apply local dev migration |
| `npm run prisma:deploy` | Run migrations in prod |
| `npm run seed` | Seed deterministic fixtures |
| `npm run lint` / `npm run format` | Static analysis / formatting |

## Deployment Notes

- Use the provided Dockerfile for container builds (multi-stage, runs `npm run build`).
- Set `DATABASE_URL`, `JWT_SECRET`, and `JWT_EXPIRES_IN` environment variables.
- On deployment, run `npm run prisma:deploy` (or rely on the Compose command) before `npm run start:prod`.
