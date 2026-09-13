import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovieImporterService } from './movie-importer.service.js';

describe('MovieImporterService', () => {
  let service: MovieImporterService;

  const tmdbServiceMock = {
    getMovieGenres: vi.fn(),
    discoverMovies: vi.fn(),
  };

  const moviesRepositoryMock = {
    upsertFromTmdb: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new MovieImporterService(
      tmdbServiceMock as any,
      moviesRepositoryMock as any,
    );
  });

  describe('importMovies', () => {
    it('should import movies from TMDB', async () => {
      tmdbServiceMock.getMovieGenres.mockResolvedValue({
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
      });

      tmdbServiceMock.discoverMovies.mockResolvedValue({
        page: 1,
        results: [
          {
            id: 27205,
            title: 'Inception',
            overview: 'A thief who steals corporate secrets.',
            release_date: '2010-07-16',
            vote_average: 8.8,
            poster_path: '/inception.jpg',
            genre_ids: [28, 878],
          },
        ],
        total_pages: 1,
        total_results: 1,
      });

      moviesRepositoryMock.upsertFromTmdb.mockResolvedValue({
        id: 1,
        title: 'Inception',
      });

      const result = await service.importMovies(1);

      expect(result).toEqual({
        imported: 1,
        pages: 1,
      });

      expect(
        tmdbServiceMock.getMovieGenres,
      ).toHaveBeenCalledTimes(1);

      expect(
        tmdbServiceMock.discoverMovies,
      ).toHaveBeenCalledWith(1);

      expect(
        moviesRepositoryMock.upsertFromTmdb,
      ).toHaveBeenCalledTimes(1);

      expect(
        moviesRepositoryMock.upsertFromTmdb,
      ).toHaveBeenCalledWith({
        tmdbId: 27205,
        title: 'Inception',
        overview: 'A thief who steals corporate secrets.',
        releaseDate: '2010-07-16',
        rating: 8.8,
        genres: ['Action', 'Science Fiction'],
        posterPath:
          'https://image.tmdb.org/t/p/w500/inception.jpg',
      });
    });

    it('should import movies from multiple pages', async () => {
      tmdbServiceMock.getMovieGenres.mockResolvedValue({
        genres: [
          {
            id: 28,
            name: 'Action',
          },
        ],
      });

      tmdbServiceMock.discoverMovies
        .mockResolvedValueOnce({
          page: 1,
          results: [
            {
              id: 1,
              title: 'Movie 1',
              overview: 'Overview 1',
              release_date: '2020-01-01',
              vote_average: 8,
              poster_path: '/movie-1.jpg',
              genre_ids: [28],
            },
          ],
          total_pages: 2,
          total_results: 2,
        })
        .mockResolvedValueOnce({
          page: 2,
          results: [
            {
              id: 2,
              title: 'Movie 2',
              overview: 'Overview 2',
              release_date: '2021-01-01',
              vote_average: 7.5,
              poster_path: '/movie-2.jpg',
              genre_ids: [28],
            },
          ],
          total_pages: 2,
          total_results: 2,
        });

      moviesRepositoryMock.upsertFromTmdb.mockResolvedValue({
        id: 1,
      });

      const result = await service.importMovies(2);

      expect(result).toEqual({
        imported: 2,
        pages: 2,
      });

      expect(
        tmdbServiceMock.discoverMovies,
      ).toHaveBeenCalledTimes(2);

      expect(
        tmdbServiceMock.discoverMovies,
      ).toHaveBeenNthCalledWith(1, 1);

      expect(
        tmdbServiceMock.discoverMovies,
      ).toHaveBeenNthCalledWith(2, 2);

      expect(
        moviesRepositoryMock.upsertFromTmdb,
      ).toHaveBeenCalledTimes(2);
    });

    it('should return zero imported movies when TMDB returns empty results', async () => {
      tmdbServiceMock.getMovieGenres.mockResolvedValue({
        genres: [],
      });

      tmdbServiceMock.discoverMovies.mockResolvedValue({
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
      });

      const result = await service.importMovies(1);

      expect(result).toEqual({
        imported: 0,
        pages: 1,
      });

      expect(
        moviesRepositoryMock.upsertFromTmdb,
      ).not.toHaveBeenCalled();
    });

    it('should create a new genre map for TMDB genre ids', async () => {
      tmdbServiceMock.getMovieGenres.mockResolvedValue({
        genres: [
          {
            id: 28,
            name: 'Action',
          },
          {
            id: 18,
            name: 'Drama',
          },
        ],
      });

      tmdbServiceMock.discoverMovies.mockResolvedValue({
        page: 1,
        results: [
          {
            id: 1,
            title: 'Test Movie',
            overview: 'Test overview',
            release_date: '2025-01-01',
            vote_average: 7.5,
            poster_path: null,
            genre_ids: [28, 18],
          },
        ],
        total_pages: 1,
        total_results: 1,
      });

      moviesRepositoryMock.upsertFromTmdb.mockResolvedValue({
        id: 1,
      });

      await service.importMovies(1);

      expect(
        moviesRepositoryMock.upsertFromTmdb,
      ).toHaveBeenCalledWith({
        tmdbId: 1,
        title: 'Test Movie',
        overview: 'Test overview',
        releaseDate: '2025-01-01',
        rating: 7.5,
        genres: ['Action', 'Drama'],
        posterPath: '',
      });
    });

    it('should propagate TMDB errors', async () => {
      const error = new Error('TMDB API error');

      tmdbServiceMock.getMovieGenres.mockRejectedValue(error);

      await expect(
        service.importMovies(1),
      ).rejects.toThrow(error);

      expect(
        tmdbServiceMock.discoverMovies,
      ).not.toHaveBeenCalled();

      expect(
        moviesRepositoryMock.upsertFromTmdb,
      ).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      tmdbServiceMock.getMovieGenres.mockResolvedValue({
        genres: [],
      });

      tmdbServiceMock.discoverMovies.mockResolvedValue({
        page: 1,
        results: [
          {
            id: 1,
            title: 'Test Movie',
            overview: 'Test overview',
            release_date: '2025-01-01',
            vote_average: 7.5,
            poster_path: null,
            genre_ids: [],
          },
        ],
        total_pages: 1,
        total_results: 1,
      });

      const error = new Error('Database error');

      moviesRepositoryMock.upsertFromTmdb.mockRejectedValue(
        error,
      );

      await expect(
        service.importMovies(1),
      ).rejects.toThrow(error);
    });
  });
});