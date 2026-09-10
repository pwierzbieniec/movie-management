import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Inception' })
  title: string;

  @ApiProperty({
    example:
      'A thief who steals corporate secrets through dream-sharing technology.',
  })
  overview: string;

  @ApiProperty({ example: '2010-07-16' })
  releaseDate: string;

  @ApiProperty({ example: 8.8 })
  rating: number;

  @ApiProperty({
    example: ['Science Fiction', 'Action'],
  })
  genres: string[];

  @ApiProperty({ example: '/inception.jpg' })
  posterPath: string;
}