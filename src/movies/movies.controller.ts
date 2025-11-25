import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { ListMoviesQueryDto } from './dto/list-movies.dto';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  list(@Query() query: ListMoviesQueryDto) {
    return this.moviesService.listMovies(query);
  }
}
