import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Body,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service.js';
import { MoviesListResponseDto } from './dto/movies-list-response.dto.js';
import { FindMoviesDto } from './dto/find-movies.dto.js';
import { MovieResponseDto } from './dto/movie-response.dto.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';

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

@Post()
@ApiCreatedResponse({
  type: MovieResponseDto,
})
create(@Body() createMovieDto: CreateMovieDto) {
  return this.moviesService.create(createMovieDto);
}
}
