import { ApiProperty } from '@nestjs/swagger';
import { MovieResponseDto } from './movie-response.dto.js';

export class MoviesListMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 500 })
  total: number;

  @ApiProperty({ example: 25 })
  totalPages: number;
}

export class MoviesListResponseDto {
  @ApiProperty({ type: [MovieResponseDto] })
  data: MovieResponseDto[];

  @ApiProperty({ type: MoviesListMetaDto })
  meta: MoviesListMetaDto;
}