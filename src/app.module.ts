import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GenresModule } from './genres/genres.module';
import { MoviesModule } from './movies/movies.module';
import { SavedMoviesModule } from './saved-movies/saved-movies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    GenresModule,
    MoviesModule,
    SavedMoviesModule,
  ],
})
export class AppModule {}
