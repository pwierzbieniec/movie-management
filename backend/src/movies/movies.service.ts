import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FindMoviesDto } from './dto/find-movies.dto.js';
import { Movie } from '../movie.interface.js';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class MoviesService {
async findAll(query: FindMoviesDto) {
  const filePath = join(process.cwd(), 'data', 'movies.json');
  const file = await readFile(filePath, 'utf-8');

  const movies = JSON.parse(file) as Movie[];

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
  const filePath = join(process.cwd(), 'data', 'movies.json');
  const file = await readFile(filePath, 'utf-8');

  const movies = JSON.parse(file) as Movie[];

  const movie = movies.find((movie) => movie.id === id);

  if (!movie) {
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  return movie;
}
}
