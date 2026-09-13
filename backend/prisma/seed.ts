import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const movies = [
  {
    title: 'Inception',
    overview:
      'A thief who steals corporate secrets through dream-sharing technology.',
    releaseDate: new Date('2010-07-16'),
    rating: 8.8,
    posterPath: 'https://image.tmdb.org/t/p/w500/inception.jpg',
    genres: ['Science Fiction', 'Action'],
  },
  {
    title: 'The Dark Knight',
    overview:
      'Batman faces a criminal mastermind known as the Joker.',
    releaseDate: new Date('2008-07-18'),
    rating: 9.0,
    posterPath: 'https://image.tmdb.org/t/p/w500/dark-knight.jpg',
    genres: ['Action', 'Crime', 'Drama'],
  },
  {
    title: 'Interstellar',
    overview:
      'A team of explorers travels through a wormhole in space.',
    releaseDate: new Date('2014-11-07'),
    rating: 8.7,
    posterPath: 'https://image.tmdb.org/t/p/w500/interstellar.jpg',
    genres: ['Science Fiction', 'Drama'],
  },
  {
    title: 'The Matrix',
    overview:
      'A hacker discovers that reality is not what it seems.',
    releaseDate: new Date('1999-03-31'),
    rating: 8.7,
    posterPath: 'https://image.tmdb.org/t/p/w500/matrix.jpg',
    genres: ['Science Fiction', 'Action'],
  },
  {
    title: 'Pulp Fiction',
    overview:
      'Several interconnected stories unfold in the criminal underworld of Los Angeles.',
    releaseDate: new Date('1994-09-10'),
    rating: 8.9,
    posterPath: 'https://image.tmdb.org/t/p/w500/pulp-fiction.jpg',
    genres: ['Crime', 'Drama'],
  },
];

async function main() {
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();

  for (const movie of movies) {
    await prisma.movie.create({
      data: {
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.releaseDate,
        rating: movie.rating,
        posterPath: movie.posterPath,
        genres: {
          create: movie.genres.map((name) => ({
            genre: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${movies.length} movies.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });