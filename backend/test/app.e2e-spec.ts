import { Test, TestingModule } from '@nestjs/testing';
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

process.env.MOVIES_DATA_FILE = 'test/data/movies.json';

describe('MoviesController (e2e)', () => {
let app: INestApplication;

const testDataPath = join(
  process.cwd(),
  'test',
  'data',
  'movies.json',
);

const fixtureDataPath = join(
  process.cwd(),
  'test',
  'fixtures',
  'movies.json',
);

beforeEach(async () => {
  await copyFile(fixtureDataPath, testDataPath);

  const moduleFixture: TestingModule = await Test.createTestingModule({
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

  await app.init();
});

  afterEach(async () => {
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
          expect(response.body).toHaveProperty('title');
          expect(response.body).toHaveProperty('rating');
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
    it('should create a movie', () => {
      return request(app.getHttpServer())
        .post('/api/movies')
        .send({
          title: 'Test Movie',
          overview: 'Test movie overview',
          releaseDate: '2025-01-01',
          rating: 8.5,
          genres: ['Drama'],
          posterPath: 'https://example.com/test-movie.jpg',
        })
        .expect(201)
        .expect((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.title).toBe('Test Movie');
          expect(response.body.rating).toBe(8.5);
        });
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
    it('should update an existing movie', () => {
      return request(app.getHttpServer())
        .patch('/api/movies/1')
        .send({
          rating: 9.5,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('id', 1);
          expect(response.body.rating).toBe(9.5);
        });
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
    it('should delete an existing movie', () => {
      return request(app.getHttpServer())
        .delete('/api/movies/1')
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('id', 1);
        });
    });

    it('should return 404 when deleting a non-existing movie', () => {
      return request(app.getHttpServer())
        .delete('/api/movies/999999')
        .expect(404);
    });
  });
});
