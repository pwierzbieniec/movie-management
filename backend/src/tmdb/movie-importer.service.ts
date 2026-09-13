import { Injectable, Logger } from '@nestjs/common';

import { MoviesRepository } from '../movies/repositories/movies.repository.js';

import { TmdbMovieMapper } from './tmdb-movie.mapper.js';
import { TmdbService } from './tmdb.service.js';

@Injectable()
export class MovieImporterService {
  private readonly logger = new Logger(MovieImporterService.name);

  private readonly maxPages = 25;

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly moviesRepository: MoviesRepository,
  ) {}

  async importMovies(numberOfPages = 10) {
    const pagesToImport = Math.min(numberOfPages, this.maxPages);

    const genreResponse = await this.tmdbService.getMovieGenres();

    const genreMap = new Map(
      genreResponse.genres.map((genre) => [genre.id, genre.name]),
    );

    let imported = 0;
    let pages = 0;

    for (let page = 1; page <= pagesToImport; page++) {
      const response = await this.tmdbService.discoverMovies(page);

      if (page > response.total_pages) {
        break;
      }

      this.logger.log(
        `Importing page ${page}/${Math.min(pagesToImport, response.total_pages)}...`,
      );

      for (const movie of response.results) {
        const importedMovie = TmdbMovieMapper.toImportMovie(
          movie,
          genreMap,
        );

        await this.moviesRepository.upsertFromTmdb(importedMovie);
        imported++;
      }

      pages++;
    }

    return {
      imported,
      pages,
    };
  }
}
