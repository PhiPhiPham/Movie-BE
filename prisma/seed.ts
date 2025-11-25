import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const genres = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sports',
  'Thriller',
  'War',
  'Western',
];

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'BR', name: 'Brazil' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
];

const actors = [
  'Aubrey Reeves',
  'Nico Alvarez',
  'Leah Porter',
  'Isabel Serrano',
  'Malik Patel',
  'Naomi Flores',
  'Tristan Cole',
  'Priya Menon',
  'Devon Bridges',
  'Riley Kim',
  'Harper Quinn',
  'Eli Manning',
  'June Adams',
  'Marcus Boyd',
  'Oliver Cohen',
  'Gia Russo',
  'Holly Burns',
  'Jude Sinclair',
  'Keira Abbott',
  'Logan Pierce',
  'Mira Hayes',
  'Owen Becker',
  'Pia Gallagher',
  'Rowan Ortiz',
  'Sage Donaldson',
  'Theo Knight',
  'Una Schafer',
  'Vera Callahan',
  'Wyatt Hoover',
  'Yara Campos',
  'Zane Chandler',
  'Anya Dunn',
  'Beau Holloway',
  'Cleo Iverson',
  'Dax James',
  'Emerson Keane',
  'Fiona Lowell',
  'Grey Maddox',
  'Hugo Nichols',
];

const directors = [
  'Jordan Keller',
  'Morgan Avery',
  'River Castillo',
  'Sasha Morrison',
  'Taylor Blake',
  'Jamie Sutton',
];

const adjectives = [
  'Silent',
  'Broken',
  'Golden',
  'Electric',
  'Lost',
  'Bold',
  'Hidden',
  'Crimson',
  'Infinite',
  'Fading',
];

const roles = ['Lead', 'Supporting', 'Cameo', 'Mentor', 'Antagonist'];

async function main() {
  await prisma.$transaction([
    prisma.savedMovie.deleteMany(),
    prisma.movieAvailability.deleteMany(),
    prisma.movieActor.deleteMany(),
    prisma.movieGenre.deleteMany(),
    prisma.movie.deleteMany(),
    prisma.actor.deleteMany(),
    prisma.genre.deleteMany(),
    prisma.country.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  await prisma.genre.createMany({
    data: genres.map((name) => ({ name })),
  });

  await prisma.country.createMany({
    data: countries,
  });

  await prisma.actor.createMany({
    data: actors.map((name) => ({ name })),
  });

  const [genreRecords, actorRecords, countryRecords] = await Promise.all([
    prisma.genre.findMany({ orderBy: { id: 'asc' } }),
    prisma.actor.findMany({ orderBy: { id: 'asc' } }),
    prisma.country.findMany({ orderBy: { code: 'asc' } }),
  ]);

  const passwordHash = await bcrypt.hash('changeme', 10);
  const users = await Promise.all(
    [
      {
        email: 'viewer1@movie.test',
        name: 'Viewer One',
        dateOfBirth: new Date('1990-01-01'),
      },
      {
        email: 'viewer2@movie.test',
        name: 'Viewer Two',
        dateOfBirth: new Date('1992-05-20'),
      },
    ].map((user) =>
      prisma.user.create({
        data: {
          email: user.email.toLowerCase(),
          name: user.name,
          dateOfBirth: user.dateOfBirth,
          passwordHash,
        },
      }),
    ),
  );

  const totalMovies = 160;
  for (let i = 0; i < totalMovies; i += 1) {
    const genreA = genreRecords[i % genreRecords.length];
    const genreB = genreRecords[(i + 5) % genreRecords.length];
    const actorA = actorRecords[i % actorRecords.length];
    const actorB = actorRecords[(i + 7) % actorRecords.length];
    const actorC = actorRecords[(i + 13) % actorRecords.length];
    const countryA = countryRecords[i % countryRecords.length];
    const countryB = countryRecords[(i + 1) % countryRecords.length];
    const countryC = countryRecords[(i + 2) % countryRecords.length];

    await prisma.movie.create({
      data: {
        title: `${adjectives[i % adjectives.length]} Horizon ${i + 1}`,
        year: 1980 + (i % 40),
        synopsis: `An ${adjectives[(i + 3) % adjectives.length].toLowerCase()} story about heroes facing challenge ${i +
          1}.`,
        runtime: 90 + (i % 45),
        director: directors[i % directors.length],
        genres: {
          create: [
            { genre: { connect: { id: genreA.id } } },
            { genre: { connect: { id: genreB.id } } },
          ],
        },
        cast: {
          create: [
            {
              actor: { connect: { id: actorA.id } },
              role: roles[i % roles.length],
            },
            {
              actor: { connect: { id: actorB.id } },
              role: roles[(i + 1) % roles.length],
            },
            {
              actor: { connect: { id: actorC.id } },
              role: roles[(i + 2) % roles.length],
            },
          ],
        },
        availability: {
          create: [
            { country: { connect: { code: countryA.code } } },
            { country: { connect: { code: countryB.code } } },
            { country: { connect: { code: countryC.code } } },
          ],
        },
      },
    });
  }

  const movies = await prisma.movie.findMany({
    select: { id: true },
    orderBy: { id: 'asc' },
    take: 40,
  });

  await prisma.savedMovie.createMany({
    data: movies.slice(0, 20).map((movie, index) => ({
      userId: users[0].id,
      movieId: movie.id,
      dateAdded: new Date(Date.now() - index * 86400000),
    })),
  });

  await prisma.savedMovie.createMany({
    data: movies.slice(10, 30).map((movie, index) => ({
      userId: users[1].id,
      movieId: movie.id,
      dateAdded: new Date(Date.now() - index * 43200000),
    })),
  });

  console.log('Seed data created. Credentials:');
  console.log('Email: viewer1@movie.test');
  console.log('Password: changeme');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
