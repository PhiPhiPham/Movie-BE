import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MoviesService } from './movies.service';
import { AppHttpException } from '../common/exceptions/app.exception';

describe('MoviesService', () => {
  let service: MoviesService;
  let prisma: PrismaService & {
    movie: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: PrismaService,
          useValue: {
            movie: {
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
            },
            $transaction: jest
              .fn()
              .mockImplementation((promises: Promise<any>[]) => Promise.all(promises)),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(MoviesService);
    prisma = moduleRef.get(PrismaService) as any;
  });

  it('applies availability filter when listing movies', async () => {
    prisma.movie.findMany.mockResolvedValue([{ id: 1, title: 'Test', year: 2020 }]);
    prisma.movie.count.mockResolvedValue(1);

    const result = await service.listMovies({
      country: 'US',
      page: 1,
      pageSize: 10,
      sort: '-year',
    });

    expect(result.data).toHaveLength(1);
    const findManyArgs = prisma.movie.findMany.mock.calls[0][0];
    expect(findManyArgs.where.availability.some.countryCode).toBe('US');
  });

  it('throws when movie is unavailable in a country', async () => {
    prisma.movie.findFirst.mockResolvedValue(null);

    await expect(service.ensureAvailable(1, 'BR')).rejects.toBeInstanceOf(
      AppHttpException,
    );
  });
});
