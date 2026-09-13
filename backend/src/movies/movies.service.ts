import { Injectable } from '@nestjs/common';
import { FindMoviesDto } from './dto/find-movies.dto.js';
import { Movie } from '../movie.interface.js';
import { NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { MoviesRepository } from './repositories/movies.repository.js';

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async findAll(query: FindMoviesDto) {
    const movies = await this.moviesRepository.findAll();

  const { page, limit, search, sortBy, sortOrder, genre } = query;

  let filteredMovies = movies;

  //Search
  if (search) {
    const searchTerm = search.toLowerCase().trim();

    filteredMovies = filteredMovies.filter((movie) =>
      movie.title.toLowerCase().includes(searchTerm),
    );
  }

  // Genre filter
  if (genre) {
  const genreTerm = genre.toLowerCase().trim();

  filteredMovies = filteredMovies.filter((movie) =>
    movie.genres.some(
      (movieGenre) => movieGenre.toLowerCase() === genreTerm,
    ),
  );
}

// Sorting
  if (sortBy) {
  filteredMovies.sort((a, b) => {
    const direction = sortOrder === 'desc' ? -1 : 1;

    if (sortBy === 'title') {
      return a.title.localeCompare(b.title) * direction;
    }

    if (sortBy === 'rating') {
      return (a.rating - b.rating) * direction;
    }

    if (sortBy === 'releaseDate') {
      return (
        (new Date(a.releaseDate).getTime() -
          new Date(b.releaseDate).getTime()) *
        direction
      );
    }

    return 0;
  });
}

// Pagination
  const total = filteredMovies.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const data = filteredMovies.slice(offset, offset + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async findOne(id: number): Promise<Movie> {

  const movies = await this.moviesRepository.findAll();

  const movie = movies.find((movie) => movie.id === id);

  if (!movie) {
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  return movie;
}

async create(createMovieDto: CreateMovieDto): Promise<Movie> {

 const movies = await this.moviesRepository.findAll();

  const newMovie: Movie = {
    id: movies.length > 0
      ? Math.max(...movies.map((movie) => movie.id)) + 1
      : 1,
    ...createMovieDto,
  };

  movies.push(newMovie);

  await this.moviesRepository.save(movies);

  return newMovie;
}

async update(
  id: number,
  updateMovieDto: UpdateMovieDto,
): Promise<Movie> {
const movies = await this.moviesRepository.findAll();

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  const updatedMovie: Movie = {
    ...movies[movieIndex],
    ...updateMovieDto,
    id,
  };

  movies[movieIndex] = updatedMovie;

  await this.moviesRepository.save(movies);

  return updatedMovie;
}

async delete(id: number): Promise<Movie> {
const movies = await this.moviesRepository.findAll();

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  const [deletedMovie] = movies.splice(movieIndex, 1);

  await this.moviesRepository.save(movies);

  return deletedMovie;
}
}
