import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({
    example: 'Inception',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'A thief who steals corporate secrets through dream-sharing technology.',
  })
  @IsString()
  overview: string;

  @ApiProperty({
    example: '2010-07-16',
  })
  @IsString()
  releaseDate: string;

  @ApiProperty({
    example: 8.8,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;

  @ApiProperty({
    example: ['Science Fiction', 'Action'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({
    example: 'https://image.tmdb.org/t/p/w500/example.jpg',
  })
  @IsUrl()
  posterPath: string;
}