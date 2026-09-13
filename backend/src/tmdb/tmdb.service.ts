import { Injectable } from '@nestjs/common';
import { TmdbClient } from './tmdb.client.js';

@Injectable()
export class TmdbService {
  constructor(private readonly tmdbClient: TmdbClient) {}

  async discoverMovies(page = 1) {
    return this.tmdbClient.discoverMovies(page);
  }

  async getMovieGenres() {
    return this.tmdbClient.getMovieGenres();
  }
}