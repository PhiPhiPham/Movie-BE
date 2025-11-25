import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MoviesService } from '../movies/movies.service';
import { ListSavedMoviesQueryDto } from './dto/list-saved-movies.dto';
import { SaveMovieDto } from './dto/save-movie.dto';
import { buildPagedResponse, getPaginationParams } from '../common/utils/pagination';
import { ErrorCode } from '../common/constants/error-codes';
import { AppHttpException } from '../common/exceptions/app.exception';

@Injectable()
export class SavedMoviesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moviesService: MoviesService,
  ) {}

  async list(userId: number, query: ListSavedMoviesQueryDto) {
    const pagination = getPaginationParams(query);
    const sortOrder =
      query.sort === 'date_added' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;
    const where: Prisma.SavedMovieWhereInput = {
      userId,
      movie: {
        availability: {
          some: { countryCode: query.country },
        },
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.savedMovie.findMany({
        skip: pagination.skip,
        take: pagination.take,
        where,
        orderBy: { dateAdded: sortOrder },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              year: true,
            },
          },
        },
      }),
      this.prisma.savedMovie.count({ where }),
    ]);

    const data = items.map((item) => ({
      id: item.movie.id,
      title: item.movie.title,
      year: item.movie.year,
      date_added: item.dateAdded,
    }));

    return buildPagedResponse(data, total, pagination);
  }

  async save(userId: number, dto: SaveMovieDto) {
    await this.ensureNotDuplicate(userId, dto.movieId);
    const movie = await this.moviesService.ensureAvailable(dto.movieId, dto.country);
    await this.prisma.savedMovie.create({
      data: {
        userId,
        movieId: dto.movieId,
      },
    });

    return {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      genres: movie.genres.map((item) => item.genre.name),
    };
  }

  async remove(userId: number, movieId: number) {
    const existing = await this.prisma.savedMovie.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!existing) {
      throw new AppHttpException(ErrorCode.NOT_SAVED, 'Movie is not saved', 404);
    }

    await this.prisma.savedMovie.delete({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });
  }

  private async ensureNotDuplicate(userId: number, movieId: number) {
    const existing = await this.prisma.savedMovie.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existing) {
      throw new AppHttpException(ErrorCode.DUPLICATE_SAVE, 'Movie already saved', 409);
    }
  }
}
