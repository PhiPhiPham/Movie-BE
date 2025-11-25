import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenresService } from './genres.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.genresService.listGenres(query);
  }
}
