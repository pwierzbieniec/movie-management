import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service.js';
import { MoviesListResponseDto } from './dto/movies-list-response.dto.js';
import { FindMoviesDto } from './dto/find-movies.dto.js';
import { MovieResponseDto } from './dto/movie-response.dto.js';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOkResponse({
    type: MoviesListResponseDto,
  })
  findAll(@Query() query: FindMoviesDto) {
    return this.moviesService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({
    type: MovieResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }
}
