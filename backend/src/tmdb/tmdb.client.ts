import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { TmdbMovieListResponseDto, TmdbGenreListResponseDto } from './dto/tmdb-movie.dto.js';

@Injectable()
export class TmdbClient {
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async discoverMovies(
    page = 1,
  ): Promise<TmdbMovieListResponseDto> {
    const token = this.configService.get<string>('TMDB_API_TOKEN');

    if (!token) {
      throw new InternalServerErrorException(
        'TMDB_API_TOKEN is not configured',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<TmdbMovieListResponseDto>(
          `${this.baseUrl}/discover/movie`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: 'application/json',
            },
            params: {
              language: 'en-US',
              sort_by: 'popularity.desc',
              page,
            },
          },
        ),
      );

      return response.data;
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch movies from TMDB',
      );
    }
  }

  async getMovieGenres(): Promise<TmdbGenreListResponseDto> {
  const token = this.configService.get<string>('TMDB_API_TOKEN');

  if (!token) {
    throw new InternalServerErrorException(
      'TMDB_API_TOKEN is not configured',
    );
  }

  try {
    const response = await firstValueFrom(
      this.httpService.get<TmdbGenreListResponseDto>(
        `${this.baseUrl}/genre/movie/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
          params: {
            language: 'en-US',
          },
        },
      ),
    );

    return response.data;
  } catch {
    throw new InternalServerErrorException(
      'Failed to fetch movie genres from TMDB',
    );
  }
}
}