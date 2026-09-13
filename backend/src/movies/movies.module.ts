import { Module } from '@nestjs/common';

import { MoviesController } from './movies.controller.js';
import { MoviesRepository } from './repositories/movies.repository.js';
import { MoviesService } from './movies.service.js';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, MoviesRepository],
  exports: [MoviesRepository],
})
export class MoviesModule {}
