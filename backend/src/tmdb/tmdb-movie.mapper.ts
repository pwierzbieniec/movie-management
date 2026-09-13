import { Movie } from '../movie.interface.js';
import { TmdbMovieDto } from './dto/tmdb-movie.dto.js';
import { TmdbMovieImport } from './tmdb-movie-import.interface.js';

export class TmdbMovieMapper {
  static toMovie(
    movie: TmdbMovieDto,
    genreMap: Map<number, string>,
  ): Movie {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      genres: movie.genre_ids
        .map((genreId) => genreMap.get(genreId))
        .filter((genre): genre is string => Boolean(genre)),
      posterPath: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '',
    };
  }

  static toImportMovie(
    movie: TmdbMovieDto,
    genreMap: Map<number, string>,
  ): TmdbMovieImport {
    return {
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      genres: movie.genre_ids
        .map((genreId) => genreMap.get(genreId))
        .filter((genre): genre is string => Boolean(genre)),
      posterPath: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '',
    };
  }
}