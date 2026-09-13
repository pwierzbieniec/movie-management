import { describe, expect, it, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';

import { TmdbClient } from './tmdb.client.js';

describe('TmdbClient', () => {
  let client: TmdbClient;

  const httpServiceMock = {
    get: vi.fn(),
  };

  const configServiceMock = {
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    client = new TmdbClient(
      httpServiceMock as any,
      configServiceMock as any,
    );
  });

  describe('discoverMovies', () => {
    it('should fetch movies from TMDB', async () => {
      const tmdbResponse = {
        page: 1,
        results: [
          {
            id: 27205,
            title: 'Inception',
          },
        ],
        total_pages: 10,
        total_results: 200,
      };

      configServiceMock.get.mockReturnValue('test-token');

      httpServiceMock.get.mockReturnValue(
        of({
          data: tmdbResponse,
        }),
      );

      const result = await client.discoverMovies();

      expect(result).toEqual(tmdbResponse);

      expect(configServiceMock.get).toHaveBeenCalledWith(
        'TMDB_API_TOKEN',
      );

      expect(httpServiceMock.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/discover/movie',
        {
          headers: {
            Authorization: 'Bearer test-token',
            accept: 'application/json',
          },
          params: {
            language: 'en-US',
            sort_by: 'popularity.desc',
            page: 1,
          },
        },
      );
    });

    it('should use provided page number', async () => {
      configServiceMock.get.mockReturnValue('test-token');

      httpServiceMock.get.mockReturnValue(
        of({
          data: {
            page: 3,
            results: [],
            total_pages: 10,
            total_results: 200,
          },
        }),
      );

      await client.discoverMovies(3);

      expect(httpServiceMock.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/discover/movie',
        expect.objectContaining({
          params: expect.objectContaining({
            page: 3,
          }),
        }),
      );
    });

    it('should throw an error when TMDB token is not configured', async () => {
      configServiceMock.get.mockReturnValue(undefined);

      await expect(
        client.discoverMovies(),
      ).rejects.toThrow(InternalServerErrorException);

      expect(httpServiceMock.get).not.toHaveBeenCalled();
    });

    it('should throw an error when TMDB request fails', async () => {
      configServiceMock.get.mockReturnValue('test-token');

      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('TMDB API error')),
      );

      await expect(
        client.discoverMovies(),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getMovieGenres', () => {
  it('should fetch movie genres from TMDB', async () => {
    const tmdbResponse = {
      genres: [
        {
          id: 28,
          name: 'Action',
        },
        {
          id: 878,
          name: 'Science Fiction',
        },
      ],
    };

    configServiceMock.get.mockReturnValue('test-token');

    httpServiceMock.get.mockReturnValue(
      of({
        data: tmdbResponse,
      }),
    );

    const result = await client.getMovieGenres();

    expect(result).toEqual(tmdbResponse);

    expect(configServiceMock.get).toHaveBeenCalledWith(
      'TMDB_API_TOKEN',
    );

    expect(httpServiceMock.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/genre/movie/list',
      {
        headers: {
          Authorization: 'Bearer test-token',
          accept: 'application/json',
        },
        params: {
          language: 'en-US',
        },
      },
    );
  });

  it('should throw an error when fetching genres fails', async () => {
    configServiceMock.get.mockReturnValue('test-token');

    httpServiceMock.get.mockReturnValue(
      throwError(() => new Error('TMDB API error')),
    );

    await expect(
      client.getMovieGenres(),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
});