import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListMoviesQueryDto } from './dto/list-movies.dto';
import { buildPagedResponse, getPaginationParams } from '../common/utils/pagination';
import { ErrorCode } from '../common/constants/error-codes';
import { AppHttpException } from '../common/exceptions/app.exception';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async listMovies(query: ListMoviesQueryDto) {
    const pagination = getPaginationParams(query);
    const sortOrder =
      query.sort === 'year' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;
    const where: Prisma.MovieWhereInput = {
      availability: {
        some: {
          countryCode: query.country,
        },
      },
    };

    if (query.genre) {
      where.genres = {
        some: {
          genreId: query.genre,
        },
      };
    }

    const [movies, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { year: sortOrder },
        where,
        select: {
          id: true,
          title: true,
          year: true,
        },
      }),
      this.prisma.movie.count({ where }),
    ]);

    return buildPagedResponse(movies, total, pagination);
  }

  async ensureAvailable(movieId: number, country: string) {
    const movie = await this.prisma.movie.findFirst({
      where: {
        id: movieId,
        availability: {
          some: { countryCode: country },
        },
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!movie) {
      throw new AppHttpException(
        ErrorCode.UNAVAILABLE_IN_COUNTRY,
        'Movie is not available in this country',
        422,
      );
    }

    return movie;
  }

  async findById(movieId: number) {
    return this.prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        genres: {
          include: { genre: true },
        },
        availability: true,
      },
    });
  }
}
