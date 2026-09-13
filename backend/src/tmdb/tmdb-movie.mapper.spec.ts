import { describe, expect, it } from 'vitest';

import { TmdbMovieMapper } from './tmdb-movie.mapper.js';

describe('TmdbMovieMapper', () => {
  it('should map a TMDB movie to application movie model', () => {
    const tmdbMovie = {
      id: 27205,
      title: 'Inception',
      overview:
        'A thief who steals corporate secrets through dream-sharing technology.',
      release_date: '2010-07-16',
      vote_average: 8.8,
      poster_path: '/inception.jpg',
      genre_ids: [28, 878],
    };

    const genreMap = new Map([
      [28, 'Action'],
      [878, 'Science Fiction'],
    ]);

    const result = TmdbMovieMapper.toMovie(
      tmdbMovie,
      genreMap,
    );

    expect(result).toEqual({
      id: 27205,
      title: 'Inception',
      overview:
        'A thief who steals corporate secrets through dream-sharing technology.',
      releaseDate: '2010-07-16',
      rating: 8.8,
      genres: ['Action', 'Science Fiction'],
      posterPath: 'https://image.tmdb.org/t/p/w500/inception.jpg',
    });
  });

  it('should handle a movie without a poster', () => {
    const tmdbMovie = {
      id: 1,
      title: 'Test Movie',
      overview: 'Test overview',
      release_date: '2025-01-01',
      vote_average: 7.5,
      poster_path: null,
      genre_ids: [],
    };

    const genreMap = new Map<number, string>();

    const result = TmdbMovieMapper.toMovie(
      tmdbMovie,
      genreMap,
    );

    expect(result.posterPath).toBe('');
    expect(result.genres).toEqual([]);
  });

  it('should ignore unknown genre ids', () => {
    const tmdbMovie = {
      id: 1,
      title: 'Test Movie',
      overview: 'Test overview',
      release_date: '2025-01-01',
      vote_average: 7.5,
      poster_path: '/test.jpg',
      genre_ids: [28, 999999],
    };

    const genreMap = new Map([
      [28, 'Action'],
    ]);

    const result = TmdbMovieMapper.toMovie(
      tmdbMovie,
      genreMap,
    );

    expect(result.genres).toEqual(['Action']);
  });
});