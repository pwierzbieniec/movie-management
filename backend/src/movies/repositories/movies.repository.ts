import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { Movie as PrismaMovie } from '../../generated/prisma/client.js';
import { Movie } from '../../movie.interface.js';
import { CreateMovieDto } from '../dto/create-movie.dto.js';
import { UpdateMovieDto } from '../dto/update-movie.dto.js';
import { FindMoviesDto } from '../dto/find-movies.dto.js';
import { TmdbMovieImport } from '../../tmdb/tmdb-movie-import.interface.js';

type PrismaMovieWithGenres = PrismaMovie & {
  genres: {
    genre: {
      name: string;
    };
  }[];
};

@Injectable()
export class MoviesRepository {
  constructor(private readonly prisma: PrismaService) {}

async findAll(query: FindMoviesDto) {
  const {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    genre,
  } = query;

  const where = {
    ...(search && {
      title: {
        contains: search.trim(),
        mode: 'insensitive' as const,
      },
    }),

    ...(genre && {
      genres: {
        some: {
          genre: {
            name: {
              equals: genre.trim(),
              mode: 'insensitive' as const,
            },
          },
        },
      },
    }),
  };

  const orderBy = sortBy
    ? {
        [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc',
      }
    : undefined;

  const skip = (page - 1) * limit;

  const [movies, total] = await Promise.all([
    this.prisma.movie.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    }),

    this.prisma.movie.count({ where }),
  ]);

  return {
    data: movies.map((movie) => this.mapToMovie(movie)),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

  async findOne(id: number): Promise<Movie | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return movie ? this.mapToMovie(movie) : null;
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = await this.prisma.movie.create({
      data: {
        title: createMovieDto.title,
        overview: createMovieDto.overview,
        releaseDate: new Date(createMovieDto.releaseDate),
        rating: createMovieDto.rating,
        posterPath: createMovieDto.posterPath,
        genres: {
          create: createMovieDto.genres.map((name) => ({
            genre: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
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

    return this.mapToMovie(movie);
  }

  async update(
    id: number,
    updateMovieDto: UpdateMovieDto,
  ): Promise<Movie | null> {
    const existingMovie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!existingMovie) {
      return null;
    }

    const { genres, releaseDate, ...movieData } = updateMovieDto;

    const movie = await this.prisma.movie.update({
      where: { id },
      data: {
        ...movieData,
        ...(releaseDate && {
          releaseDate: new Date(releaseDate),
        }),
        ...(genres && {
          genres: {
            deleteMany: {},
            create: genres.map((name) => ({
              genre: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            })),
          },
        }),
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return this.mapToMovie(movie);
  }

  async delete(id: number): Promise<Movie | null> {
    const existingMovie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!existingMovie) {
      return null;
    }

    await this.prisma.movie.delete({
      where: { id },
    });

    return this.mapToMovie(existingMovie);
  }

  private mapToMovie(movie: PrismaMovieWithGenres): Movie {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.releaseDate.toISOString().split('T')[0],
      rating: movie.rating,
      genres: movie.genres.map((movieGenre) => movieGenre.genre.name),
      posterPath: movie.posterPath,
    };
  }

async upsertFromTmdb(movie: TmdbMovieImport): Promise<Movie> {
  return this.prisma.$transaction(async (tx) => {
    const movieData = {
      title: movie.title,
      overview: movie.overview,
      releaseDate: new Date(movie.releaseDate),
      rating: movie.rating,
      posterPath: movie.posterPath,
    };

    const savedMovie = await tx.movie.upsert({
      where: { tmdbId: movie.tmdbId },
      update: movieData,
      create: {
        tmdbId: movie.tmdbId,
        ...movieData,
      },
    });

    await tx.movieGenre.deleteMany({
      where: {
        movieId: savedMovie.id,
      },
    });

    for (const name of movie.genres) {
      const genre = await tx.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      await tx.movieGenre.create({
        data: {
          movieId: savedMovie.id,
          genreId: genre.id,
        },
      });
    }

    const movieWithGenres = await tx.movie.findUniqueOrThrow({
      where: { id: savedMovie.id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return this.mapToMovie(movieWithGenres);
  });
}
}