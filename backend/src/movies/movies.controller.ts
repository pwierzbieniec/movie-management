import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { Movie } from '../movie.interface.js';
import { FindMoviesDto } from './dto/find-movies.dto.js';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Get()
    async findAll(@Query() query: FindMoviesDto) {
        return this.moviesService.findAll(query);
    }
}
