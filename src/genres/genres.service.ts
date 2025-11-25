import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildPagedResponse, getPaginationParams } from '../common/utils/pagination';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async listGenres(query: PaginationQueryDto) {
    const pagination = getPaginationParams(query);
    const [genres, total] = await this.prisma.$transaction([
      this.prisma.genre.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { name: Prisma.SortOrder.asc },
      }),
      this.prisma.genre.count(),
    ]);

    return buildPagedResponse(genres, total, pagination);
  }
}
