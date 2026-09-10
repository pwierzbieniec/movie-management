import { Controller, Get } from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { Movie } from '../movie.interface.js';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Get()
    async findAll(): Promise<Movie[]> {
        return this.moviesService.findAll();
    }
}
