import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MoviesModule } from '../movies/movies.module.js';
import { MovieImporterService } from './movie-importer.service.js';
import { TmdbClient } from './tmdb.client.js';
import { TmdbService } from './tmdb.service.js';

@Module({
  imports: [HttpModule, MoviesModule],
  providers: [
    TmdbClient,
    TmdbService,
    MovieImporterService,
  ],
  exports: [
    TmdbService,
    MovieImporterService,
  ],
})
export class TmdbModule {}