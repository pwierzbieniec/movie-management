import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/database/prisma.service.js';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const movies = [
    {
      title: 'Inception',
      overview:
        'A thief who steals corporate secrets through dream-sharing technology.',
      releaseDate: new Date('2010-07-16'),
      rating: 8.8,
      posterPath: 'https://example.com/inception.jpg',
      genres: ['Science Fiction', 'Action'],
    },
    {
      title: 'The Dark Knight',
      overview: 'Batman faces a criminal mastermind known as the Joker.',
      releaseDate: new Date('2008-07-18'),
      rating: 9.0,
      posterPath: 'https://example.com/dark-knight.jpg',
      genres: ['Action', 'Crime', 'Drama'],
    },
    {
      title: 'Interstellar',
      overview: 'A team of explorers travels through a wormhole in space.',
      releaseDate: new Date('2014-11-07'),
      rating: 8.7,
      posterPath: 'https://example.com/interstellar.jpg',
      genres: ['Science Fiction', 'Drama'],
    },
    {
      title: 'The Matrix',
      overview: 'A hacker discovers that reality is not what it seems.',
      releaseDate: new Date('1999-03-31'),
      rating: 8.7,
      posterPath: 'https://example.com/matrix.jpg',
      genres: ['Science Fiction', 'Action'],
    },
    {
      title: 'Pulp Fiction',
      overview:
        'Several interconnected stories unfold in the criminal underworld of Los Angeles.',
      releaseDate: new Date('1994-09-10'),
      rating: 8.9,
      posterPath: 'https://example.com/pulp-fiction.jpg',
      genres: ['Crime', 'Drama'],
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

beforeEach(async () => {
  await prisma.$executeRaw`
    TRUNCATE TABLE "Movie" RESTART IDENTITY CASCADE
  `;

  await prisma.$executeRaw`
    TRUNCATE TABLE "Genre" RESTART IDENTITY CASCADE
  `;

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
  });

afterAll(async () => {
  await prisma.$executeRaw`
    TRUNCATE TABLE "Movie" RESTART IDENTITY CASCADE
  `;

  await prisma.$executeRaw`
    TRUNCATE TABLE "Genre" RESTART IDENTITY CASCADE
  `;

  await app.close();
});

  describe('GET /api/movies', () => {
    it('should return a paginated list of movies', () => {
      return request(app.getHttpServer())
        .get('/api/movies')
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('data');
          expect(response.body).toHaveProperty('meta');

          expect(Array.isArray(response.body.data)).toBe(true);

          expect(response.body.meta).toHaveProperty('page');
          expect(response.body.meta).toHaveProperty('limit');
          expect(response.body.meta).toHaveProperty('total');
          expect(response.body.meta).toHaveProperty('totalPages');

          expect(response.body.meta.total).toBe(5);
        });
    });

    it('should respect pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/api/movies?page=1&limit=2')
        .expect(200)
        .expect((response) => {
          expect(response.body.data).toHaveLength(2);
          expect(response.body.meta.page).toBe(1);
          expect(response.body.meta.limit).toBe(2);
          expect(response.body.meta.total).toBe(5);
          expect(response.body.meta.totalPages).toBe(3);
        });
    });

    it('should search movies by title', () => {
      return request(app.getHttpServer())
        .get('/api/movies?search=inception')
        .expect(200)
        .expect((response) => {
          expect(response.body.data).toHaveLength(1);
          expect(response.body.data[0].title).toBe('Inception');
          expect(response.body.meta.total).toBe(1);
        });
    });

    it('should filter movies by genre', () => {
      return request(app.getHttpServer())
        .get('/api/movies?genre=Action')
        .expect(200)
        .expect((response) => {
          expect(response.body.meta.total).toBe(3);

          expect(
            response.body.data.every((movie: { genres: string[] }) =>
              movie.genres.includes('Action'),
            ),
          ).toBe(true);
        });
    });

    it('should sort movies by rating descending', () => {
      return request(app.getHttpServer())
        .get('/api/movies?sortBy=rating&sortOrder=desc')
        .expect(200)
        .expect((response) => {
          const ratings = response.body.data.map(
            (movie: { rating: number }) => movie.rating,
          );

          expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
        });
    });
  });

  describe('GET /api/movies/:id', () => {
    it('should return a movie by id', () => {
      return request(app.getHttpServer())
        .get('/api/movies/1')
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('id', 1);
          expect(response.body).toHaveProperty('title', 'Inception');
          expect(response.body).toHaveProperty('rating', 8.8);
          expect(response.body).toHaveProperty('genres');
        });
    });

    it('should return 404 for a non-existing movie', () => {
      return request(app.getHttpServer())
        .get('/api/movies/999999')
        .expect(404);
    });

    it('should return 400 for an invalid id', () => {
      return request(app.getHttpServer())
        .get('/api/movies/abc')
        .expect(400);
    });
  });

  describe('POST /api/movies', () => {
    it('should create a movie', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/movies')
        .send({
          title: 'Test Movie',
          overview: 'Test movie overview',
          releaseDate: '2025-01-01',
          rating: 8.5,
          genres: ['Drama'],
          posterPath: 'https://example.com/test-movie.jpg',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Movie');
      expect(response.body.rating).toBe(8.5);
      expect(response.body.genres).toEqual(['Drama']);

      const movie = await prisma.movie.findUnique({
        where: {
          id: response.body.id,
        },
      });

      expect(movie).not.toBeNull();
      expect(movie?.title).toBe('Test Movie');
    });

    it('should reject invalid movie data', () => {
      return request(app.getHttpServer())
        .post('/api/movies')
        .send({
          title: 'Invalid Movie',
          overview: 'Test',
          releaseDate: '2025-01-01',
          rating: 15,
          genres: [],
          posterPath: 'invalid-url',
        })
        .expect(400);
    });
  });

  describe('PATCH /api/movies/:id', () => {
    it('should update an existing movie', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/movies/1')
        .send({
          rating: 9.5,
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body.rating).toBe(9.5);

      const movie = await prisma.movie.findUnique({
        where: {
          id: 1,
        },
      });

      expect(movie?.rating).toBe(9.5);
    });

    it('should return 404 when updating a non-existing movie', () => {
      return request(app.getHttpServer())
        .patch('/api/movies/999999')
        .send({
          rating: 9.5,
        })
        .expect(404);
    });
  });

  describe('DELETE /api/movies/:id', () => {
    it('should delete an existing movie', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/movies/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);

      const movie = await prisma.movie.findUnique({
        where: {
          id: 1,
        },
      });

      expect(movie).toBeNull();
    });

    it('should return 404 when deleting a non-existing movie', () => {
      return request(app.getHttpServer())
        .delete('/api/movies/999999')
        .expect(404);
    });
  });
});