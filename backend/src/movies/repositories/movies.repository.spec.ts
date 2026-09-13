import { describe, expect, it, beforeEach, vi } from 'vitest';

import { MoviesRepository } from './movies.repository.js';

describe('MoviesRepository', () => {
  let repository: MoviesRepository;

  const prismaMock = {
    movie: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    genre: {
      deleteMany: vi.fn(),
    },
  };

  const prismaMovies = [
    {
      id: 1,
      title: 'Inception',
      overview:
        'A thief who steals corporate secrets through dream-sharing technology.',
      releaseDate: new Date('2010-07-16'),
      rating: 8.8,
      posterPath: 'https://example.com/inception.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      genres: [
        {
          genre: {
            id: 1,
            name: 'Science Fiction',
          },
        },
        {
          genre: {
            id: 2,
            name: 'Action',
          },
        },
      ],
    },
    {
      id: 2,
      title: 'The Dark Knight',
      overview: 'Batman faces a criminal mastermind known as the Joker.',
      releaseDate: new Date('2008-07-18'),
      rating: 9.0,
      posterPath: 'https://example.com/dark-knight.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      genres: [
        {
          genre: {
            id: 2,
            name: 'Action',
          },
        },
        {
          genre: {
            id: 3,
            name: 'Crime',
          },
        },
        {
          genre: {
            id: 4,
            name: 'Drama',
          },
        },
      ],
    },
    {
      id: 3,
      title: 'Interstellar',
      overview: 'A team of explorers travels through a wormhole in space.',
      releaseDate: new Date('2014-11-07'),
      rating: 8.7,
      posterPath: 'https://example.com/interstellar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      genres: [
        {
          genre: {
            id: 1,
            name: 'Science Fiction',
          },
        },
        {
          genre: {
            id: 4,
            name: 'Drama',
          },
        },
      ],
    },
    {
      id: 4,
      title: 'The Matrix',
      overview: 'A hacker discovers that reality is not what it seems.',
      releaseDate: new Date('1999-03-31'),
      rating: 8.7,
      posterPath: 'https://example.com/matrix.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      genres: [
        {
          genre: {
            id: 1,
            name: 'Science Fiction',
          },
        },
        {
          genre: {
            id: 2,
            name: 'Action',
          },
        },
      ],
    },
    {
      id: 5,
      title: 'Pulp Fiction',
      overview:
        'Several interconnected stories unfold in the criminal underworld of Los Angeles.',
      releaseDate: new Date('1994-09-10'),
      rating: 8.9,
      posterPath: 'https://example.com/pulp-fiction.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      genres: [
        {
          genre: {
            id: 3,
            name: 'Crime',
          },
        },
        {
          genre: {
            id: 4,
            name: 'Drama',
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new MoviesRepository(prismaMock as any);
  });

  describe('findAll', () => {
    it('should return paginated movies', async () => {
      prismaMock.movie.findMany.mockResolvedValue([
        prismaMovies[0],
        prismaMovies[1],
      ]);

      prismaMock.movie.count.mockResolvedValue(5);

      const result = await repository.findAll({
        page: 1,
        limit: 2,
      });

      expect(result).toEqual({
        data: [
          {
            id: 1,
            title: 'Inception',
            overview:
              'A thief who steals corporate secrets through dream-sharing technology.',
            releaseDate: '2010-07-16',
            rating: 8.8,
            genres: ['Science Fiction', 'Action'],
            posterPath: 'https://example.com/inception.jpg',
          },
          {
            id: 2,
            title: 'The Dark Knight',
            overview:
              'Batman faces a criminal mastermind known as the Joker.',
            releaseDate: '2008-07-18',
            rating: 9,
            genres: ['Action', 'Crime', 'Drama'],
            posterPath: 'https://example.com/dark-knight.jpg',
          },
        ],
        meta: {
          page: 1,
          limit: 2,
          total: 5,
          totalPages: 3,
        },
      });

      expect(prismaMock.movie.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.movie.count).toHaveBeenCalledTimes(1);
    });

    it('should calculate skip based on page and limit', async () => {
      prismaMock.movie.findMany.mockResolvedValue([prismaMovies[2]]);
      prismaMock.movie.count.mockResolvedValue(5);

      await repository.findAll({
        page: 2,
        limit: 2,
      });

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: undefined,
        skip: 2,
        take: 2,
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });
    });

    it('should filter movies by title search', async () => {
      prismaMock.movie.findMany.mockResolvedValue([prismaMovies[0]]);
      prismaMock.movie.count.mockResolvedValue(1);

      const result = await repository.findAll({
        page: 1,
        limit: 20,
        search: 'inception',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Inception');

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            title: {
              contains: 'inception',
              mode: 'insensitive',
            },
          },
        }),
      );
    });

    it('should trim search value', async () => {
      prismaMock.movie.findMany.mockResolvedValue([prismaMovies[0]]);
      prismaMock.movie.count.mockResolvedValue(1);

      await repository.findAll({
        page: 1,
        limit: 20,
        search: '  inception  ',
      });

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            title: {
              contains: 'inception',
              mode: 'insensitive',
            },
          },
        }),
      );
    });

    it('should filter movies by genre', async () => {
      prismaMock.movie.findMany.mockResolvedValue([
        prismaMovies[0],
        prismaMovies[3],
      ]);

      prismaMock.movie.count.mockResolvedValue(2);

      const result = await repository.findAll({
        page: 1,
        limit: 20,
        genre: 'Action',
      });

      expect(result.data).toHaveLength(2);

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            genres: {
              some: {
                genre: {
                  name: {
                    equals: 'Action',
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        }),
      );
    });

    it('should trim genre value', async () => {
      prismaMock.movie.findMany.mockResolvedValue([prismaMovies[0]]);
      prismaMock.movie.count.mockResolvedValue(1);

      await repository.findAll({
        page: 1,
        limit: 20,
        genre: '  Action  ',
      });

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            genres: {
              some: {
                genre: {
                  name: {
                    equals: 'Action',
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        }),
      );
    });

    it('should sort movies by rating descending', async () => {
      prismaMock.movie.findMany.mockResolvedValue([
        prismaMovies[1],
        prismaMovies[4],
      ]);

      prismaMock.movie.count.mockResolvedValue(5);

      await repository.findAll({
        page: 1,
        limit: 20,
        sortBy: 'rating',
        sortOrder: 'desc',
      });

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            rating: 'desc',
          },
        }),
      );
    });

    it('should sort movies by title ascending', async () => {
      prismaMock.movie.findMany.mockResolvedValue([
        prismaMovies[0],
        prismaMovies[1],
      ]);

      prismaMock.movie.count.mockResolvedValue(5);

      await repository.findAll({
        page: 1,
        limit: 20,
        sortBy: 'title',
        sortOrder: 'asc',
      });

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            title: 'asc',
          },
        }),
      );
    });

    it('should use ascending order by default', async () => {
      prismaMock.movie.findMany.mockResolvedValue([prismaMovies[0]]);
      prismaMock.movie.count.mockResolvedValue(5);

      await repository.findAll({
        page: 1,
        limit: 20,
        sortBy: 'rating',
      });

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            rating: 'asc',
          },
        }),
      );
    });

    it('should combine search, genre, sorting and pagination', async () => {
      prismaMock.movie.findMany.mockResolvedValue([prismaMovies[0]]);
      prismaMock.movie.count.mockResolvedValue(1);

      const result = await repository.findAll({
        page: 2,
        limit: 1,
        search: 'inception',
        genre: 'Action',
        sortBy: 'rating',
        sortOrder: 'desc',
      });

      expect(result.meta).toEqual({
        page: 2,
        limit: 1,
        total: 1,
        totalPages: 1,
      });

      expect(prismaMock.movie.findMany).toHaveBeenCalledWith({
        where: {
          title: {
            contains: 'inception',
            mode: 'insensitive',
          },
          genres: {
            some: {
              genre: {
                name: {
                  equals: 'Action',
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        orderBy: {
          rating: 'desc',
        },
        skip: 1,
        take: 1,
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a movie when it exists', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(prismaMovies[0]);

      const result = await repository.findOne(1);

      expect(result).toEqual({
        id: 1,
        title: 'Inception',
        overview:
          'A thief who steals corporate secrets through dream-sharing technology.',
        releaseDate: '2010-07-16',
        rating: 8.8,
        genres: ['Science Fiction', 'Action'],
        posterPath: 'https://example.com/inception.jpg',
      });

      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });
    });

    it('should return null when movie does not exist', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();

      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });
    });
  });

  describe('create', () => {
    it('should create a movie with genres', async () => {
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
        title: createMovieDto.title,
        overview: createMovieDto.overview,
        releaseDate: new Date(createMovieDto.releaseDate),
        rating: createMovieDto.rating,
        posterPath: createMovieDto.posterPath,
        createdAt: new Date(),
        updatedAt: new Date(),
        genres: [
          {
            genre: {
              id: 1,
              name: 'Science Fiction',
            },
          },
          {
            genre: {
              id: 5,
              name: 'Adventure',
            },
          },
        ],
      };

      prismaMock.movie.create.mockResolvedValue(createdMovie);

      const result = await repository.create(createMovieDto);

      expect(result).toEqual({
        id: 6,
        title: 'Dune',
        overview: 'A noble family becomes embroiled in a war.',
        releaseDate: '2021-10-22',
        rating: 8.0,
        genres: ['Science Fiction', 'Adventure'],
        posterPath: 'https://example.com/dune.jpg',
      });

      expect(prismaMock.movie.create).toHaveBeenCalledWith({
        data: {
          title: 'Dune',
          overview: 'A noble family becomes embroiled in a war.',
          releaseDate: new Date('2021-10-22'),
          rating: 8.0,
          posterPath: 'https://example.com/dune.jpg',
          genres: {
            create: [
              {
                genre: {
                  connectOrCreate: {
                    where: {
                      name: 'Science Fiction',
                    },
                    create: {
                      name: 'Science Fiction',
                    },
                  },
                },
              },
              {
                genre: {
                  connectOrCreate: {
                    where: {
                      name: 'Adventure',
                    },
                    create: {
                      name: 'Adventure',
                    },
                  },
                },
              },
            ],
          },
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should return null when movie does not exist', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(null);

      const result = await repository.update(999, {
        rating: 9.5,
      });

      expect(result).toBeNull();

      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });

      expect(prismaMock.movie.update).not.toHaveBeenCalled();
    });

    it('should update a movie', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(prismaMovies[0]);

      const updatedMovie = {
        ...prismaMovies[0],
        rating: 9.5,
      };

      prismaMock.movie.update.mockResolvedValue(updatedMovie);

      const result = await repository.update(1, {
        rating: 9.5,
      });

      expect(result).toEqual({
        id: 1,
        title: 'Inception',
        overview:
          'A thief who steals corporate secrets through dream-sharing technology.',
        releaseDate: '2010-07-16',
        rating: 9.5,
        genres: ['Science Fiction', 'Action'],
        posterPath: 'https://example.com/inception.jpg',
      });

      expect(prismaMock.movie.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          rating: 9.5,
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });
    });

    it('should update genres when genres are provided', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(prismaMovies[0]);

      const updatedMovie = {
        ...prismaMovies[0],
        genres: [
          {
            genre: {
              id: 4,
              name: 'Drama',
            },
          },
        ],
      };

      prismaMock.movie.update.mockResolvedValue(updatedMovie);

      await repository.update(1, {
        genres: ['Drama'],
      });

      expect(prismaMock.movie.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          genres: {
            deleteMany: {},
            create: [
              {
                genre: {
                  connectOrCreate: {
                    where: {
                      name: 'Drama',
                    },
                    create: {
                      name: 'Drama',
                    },
                  },
                },
              },
            ],
          },
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });
    });

    it('should update release date when provided', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(prismaMovies[0]);

      const updatedMovie = {
        ...prismaMovies[0],
        releaseDate: new Date('2011-01-01'),
      };

      prismaMock.movie.update.mockResolvedValue(updatedMovie);

      const result = await repository.update(1, {
        releaseDate: '2011-01-01',
      });

      expect(result?.releaseDate).toBe('2011-01-01');

      expect(prismaMock.movie.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            releaseDate: new Date('2011-01-01'),
          },
        }),
      );
    });
  });

  describe('delete', () => {
    it('should return null when movie does not exist', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(null);

      const result = await repository.delete(999);

      expect(result).toBeNull();

      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });

      expect(prismaMock.movie.delete).not.toHaveBeenCalled();
    });

    it('should delete an existing movie', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(prismaMovies[0]);
      prismaMock.movie.delete.mockResolvedValue(prismaMovies[0]);

      const result = await repository.delete(1);

      expect(result).toEqual({
        id: 1,
        title: 'Inception',
        overview:
          'A thief who steals corporate secrets through dream-sharing technology.',
        releaseDate: '2010-07-16',
        rating: 8.8,
        genres: ['Science Fiction', 'Action'],
        posterPath: 'https://example.com/inception.jpg',
      });

      expect(prismaMock.movie.delete).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });
  });
});