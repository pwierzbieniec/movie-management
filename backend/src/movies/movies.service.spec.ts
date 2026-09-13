import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { MoviesRepository } from './repositories/movies.repository.js';

describe('MoviesService', () => {
  let service: MoviesService;

  const movies = [
    {
      id: 1,
      title: 'Inception',
      overview:
        'A thief who steals corporate secrets through dream-sharing technology.',
      releaseDate: '2010-07-16',
      rating: 8.8,
      genres: ['Science Fiction', 'Action'],
      posterPath: '/inception.jpg',
    },
    {
      id: 2,
      title: 'The Dark Knight',
      overview: 'A masked vigilante fights crime in Gotham City.',
      releaseDate: '2008-07-18',
      rating: 9,
      genres: ['Action', 'Crime', 'Drama'],
      posterPath: '/dark-knight.jpg',
    },
    {
      id: 3,
      title: 'Interstellar',
      overview: 'A team of explorers travel through a wormhole in space.',
      releaseDate: '2014-11-07',
      rating: 8.7,
      genres: ['Science Fiction', 'Drama'],
      posterPath: '/interstellar.jpg',
    },
    {
      id: 4,
      title: 'The Matrix',
      overview:
        'A computer hacker discovers that reality is not what it seems.',
      releaseDate: '1999-03-31',
      rating: 8.7,
      genres: ['Science Fiction', 'Action'],
      posterPath: '/matrix.jpg',
    },
    {
      id: 5,
      title: 'Pulp Fiction',
      overview:
        'The lives of two hitmen, a boxer and others intertwine in Los Angeles.',
      releaseDate: '1994-09-10',
      rating: 8.9,
      genres: ['Crime', 'Drama'],
      posterPath: '/pulp-fiction.jpg',
    },
  ];

  const moviesRepositoryMock = {
    findAll: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: MoviesRepository,
          useValue: moviesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);

    vi.clearAllMocks();

    moviesRepositoryMock.findAll.mockResolvedValue(
      structuredClone(movies),
    );
  });

  describe('findOne', () => {
    it('should return a movie when movie exists', async () => {
      const movie = await service.findOne(1);

      expect(movie).toBeDefined();
      expect(movie.id).toBe(1);
      expect(movie.title).toBe('Inception');
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      await expect(service.findOne(999999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated movies', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 2,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.total).toBe(5);
      expect(result.meta.totalPages).toBe(3);
    });

    it('should search movies by title', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 20,
        search: 'inception',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Inception');
    });

    it('should filter movies by genre', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 20,
        genre: 'Action',
      });

      expect(result.data.length).toBeGreaterThan(0);

      result.data.forEach((movie) => {
        expect(
          movie.genres.some(
            (genre) => genre.toLowerCase() === 'action',
          ),
        ).toBe(true);
      });
    });

    it('should sort movies by rating descending', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 20,
        sortBy: 'rating',
        sortOrder: 'desc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].rating).toBeGreaterThanOrEqual(
          result.data[i].rating,
        );
      }
    });

    it('should sort movies by title ascending', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 20,
        sortBy: 'title',
        sortOrder: 'asc',
      });

      for (let i = 1; i < result.data.length; i++) {
        expect(
          result.data[i - 1].title.localeCompare(
            result.data[i].title,
          ),
        ).toBeLessThanOrEqual(0);
      }
    });

    it('should calculate totalPages correctly', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 2,
      });

      expect(result.meta.totalPages).toBe(
        Math.ceil(result.meta.total / result.meta.limit),
      );
    });

    it('should combine search, genre, sorting and pagination', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 2,
        search: 'the',
        genre: 'Action',
        sortBy: 'rating',
        sortOrder: 'desc',
      });

      expect(result.data.length).toBeLessThanOrEqual(2);

      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].rating).toBeGreaterThanOrEqual(
          result.data[i].rating,
        );
      }

      result.data.forEach((movie) => {
        expect(movie.title.toLowerCase()).toContain('the');
        expect(
          movie.genres.some(
            (genre) => genre.toLowerCase() === 'action',
          ),
        ).toBe(true);
      });
    });
  });

  describe('create', () => {
    it('should create a new movie', async () => {
      const createMovieDto = {
        title: 'Dune',
        overview: 'A noble family becomes embroiled in a war.',
        releaseDate: '2021-10-22',
        rating: 8.0,
        genres: ['Science Fiction', 'Adventure'],
        posterPath: 'https://example.com/dune.jpg',
      };

      const movie = await service.create(createMovieDto);

      expect(movie).toBeDefined();
      expect(movie.id).toBe(6);
      expect(movie.title).toBe(createMovieDto.title);
      expect(movie.rating).toBe(createMovieDto.rating);
      expect(movie.genres).toEqual(createMovieDto.genres);

      expect(moviesRepositoryMock.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update an existing movie', async () => {
      const updateMovieDto = {
        rating: 9.5,
      };

      const movie = await service.update(1, updateMovieDto);

      expect(movie).toBeDefined();
      expect(movie.id).toBe(1);
      expect(movie.rating).toBe(9.5);
      expect(movie.title).toBe('Inception');

      expect(moviesRepositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      await expect(
        service.update(999999, { rating: 9.5 }),
      ).rejects.toThrow(NotFoundException);

      expect(moviesRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an existing movie', async () => {
      const movie = await service.delete(1);

      expect(movie).toBeDefined();
      expect(movie.id).toBe(1);

      expect(moviesRepositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      await expect(
        service.delete(999999),
      ).rejects.toThrow(NotFoundException);

      expect(moviesRepositoryMock.save).not.toHaveBeenCalled();
    });
  });
});
