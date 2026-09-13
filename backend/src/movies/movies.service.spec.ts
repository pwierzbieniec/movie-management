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
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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
  });

  describe('findAll', () => {
    it('should return movies from repository', async () => {
      const query = {
        page: 1,
        limit: 2,
      };

      const repositoryResult = {
        data: [movies[0], movies[1]],
        meta: {
          page: 1,
          limit: 2,
          total: 5,
          totalPages: 3,
        },
      };

      moviesRepositoryMock.findAll.mockResolvedValue(repositoryResult);

      const result = await service.findAll(query);

      expect(result).toEqual(repositoryResult);

      expect(moviesRepositoryMock.findAll).toHaveBeenCalledTimes(1);
      expect(moviesRepositoryMock.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a movie when movie exists', async () => {
      moviesRepositoryMock.findOne.mockResolvedValue(movies[0]);

      const movie = await service.findOne(1);

      expect(movie).toEqual(movies[0]);

      expect(moviesRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(moviesRepositoryMock.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      moviesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(999999),
      ).rejects.toThrow(NotFoundException);

      expect(moviesRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(moviesRepositoryMock.findOne).toHaveBeenCalledWith(999999);
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

      const createdMovie = {
        id: 6,
        ...createMovieDto,
      };

      moviesRepositoryMock.create.mockResolvedValue(createdMovie);

      const movie = await service.create(createMovieDto);

      expect(movie).toEqual(createdMovie);

      expect(moviesRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(moviesRepositoryMock.create).toHaveBeenCalledWith(
        createMovieDto,
      );
    });
  });

  describe('update', () => {
    it('should update an existing movie', async () => {
      const updateMovieDto = {
        rating: 9.5,
      };

      const updatedMovie = {
        ...movies[0],
        rating: 9.5,
      };

      moviesRepositoryMock.update.mockResolvedValue(updatedMovie);

      const movie = await service.update(1, updateMovieDto);

      expect(movie).toEqual(updatedMovie);

      expect(moviesRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(moviesRepositoryMock.update).toHaveBeenCalledWith(
        1,
        updateMovieDto,
      );
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      const updateMovieDto = {
        rating: 9.5,
      };

      moviesRepositoryMock.update.mockResolvedValue(null);

      await expect(
        service.update(999999, updateMovieDto),
      ).rejects.toThrow(NotFoundException);

      expect(moviesRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(moviesRepositoryMock.update).toHaveBeenCalledWith(
        999999,
        updateMovieDto,
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing movie', async () => {
      moviesRepositoryMock.delete.mockResolvedValue(movies[0]);

      const movie = await service.delete(1);

      expect(movie).toEqual(movies[0]);

      expect(moviesRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(moviesRepositoryMock.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      moviesRepositoryMock.delete.mockResolvedValue(null);

      await expect(
        service.delete(999999),
      ).rejects.toThrow(NotFoundException);

      expect(moviesRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(moviesRepositoryMock.delete).toHaveBeenCalledWith(999999);
    });
  });
});
