import { Module } from '@nestjs/common';
import { SavedMoviesService } from './saved-movies.service';
import { SavedMoviesController } from './saved-movies.controller';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [MoviesModule],
  controllers: [SavedMoviesController],
  providers: [SavedMoviesService],
})
export class SavedMoviesModule {}
