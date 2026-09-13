import { Injectable, NotFoundException } from '@nestjs/common';

import { FindMoviesDto } from './dto/find-movies.dto.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { MoviesRepository } from './repositories/movies.repository.js';

import { Movie } from '../movie.interface.js';

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) {}

async findAll(query: FindMoviesDto) {
  return this.moviesRepository.findAll(query);
}

async findOne(id: number): Promise<Movie> {
  const movie = await this.moviesRepository.findOne(id);

  if (!movie) {
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  return movie;
}

async create(createMovieDto: CreateMovieDto): Promise<Movie> {
  return this.moviesRepository.create(createMovieDto);
}

async update(
  id: number,
  updateMovieDto: UpdateMovieDto,
): Promise<Movie> {
  const movie = await this.moviesRepository.update(id, updateMovieDto);

  if (!movie) {
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  return movie;
}

async delete(id: number): Promise<Movie> {
  const movie = await this.moviesRepository.delete(id);

  if (!movie) {
    throw new NotFoundException(`Movie with id ${id} not found`);
  }

  return movie;
}
}
