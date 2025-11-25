import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SavedMoviesService } from './saved-movies.service';
import { MoviesService } from '../movies/movies.service';
import { AppHttpException } from '../common/exceptions/app.exception';

describe('SavedMoviesService', () => {
  let service: SavedMoviesService;
  let prisma: PrismaService & {
    savedMovie: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SavedMoviesService,
        {
          provide: PrismaService,
          useValue: {
            savedMovie: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest
              .fn()
              .mockImplementation((promises: Promise<any>[]) => Promise.all(promises)),
          },
        },
        {
          provide: MoviesService,
          useValue: {
            ensureAvailable: jest.fn().mockResolvedValue({
              id: 10,
              title: 'Mock movie',
              year: 2020,
              genres: [{ genre: { name: 'Drama' } }],
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(SavedMoviesService);
    prisma = moduleRef.get(PrismaService) as any;
  });

  it('prevents duplicate saves', async () => {
    prisma.savedMovie.findUnique.mockResolvedValue({ userId: 1, movieId: 10 });

    await expect(service.save(1, { movieId: 10, country: 'US' })).rejects.toBeInstanceOf(
      AppHttpException,
    );
  });

  it('filters saved list by availability country', async () => {
    prisma.savedMovie.findMany.mockResolvedValue([
      {
        movie: { id: 1, title: 'Movie A', year: 2010 },
        dateAdded: new Date(),
      },
    ]);
    prisma.savedMovie.count.mockResolvedValue(1);
    prisma.savedMovie.findUnique.mockResolvedValue(null);

    const result = await service.list(1, {
      country: 'US',
      page: 1,
      pageSize: 10,
      sort: '-date_added',
    });

    expect(result.data).toHaveLength(1);
    const args = prisma.savedMovie.findMany.mock.calls[0][0];
    expect(args.where.movie.availability.some.countryCode).toBe('US');
  });
});
