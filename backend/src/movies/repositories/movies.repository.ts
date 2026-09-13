import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { Movie as PrismaMovie } from '../../generated/prisma/client.js';
import { Movie } from '../../movie.interface.js';
import { CreateMovieDto } from '../dto/create-movie.dto.js';
import { UpdateMovieDto } from '../dto/update-movie.dto.js';

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

  async findAll(): Promise<Movie[]> {
    const movies = await this.prisma.movie.findMany({
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return movies.map((movie) => this.mapToMovie(movie));
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
}