import { TmdbMovieDto } from './dto/tmdb-movie.dto.js';

export interface TmdbMovieImport {
  tmdbId: TmdbMovieDto['id'];
  title: TmdbMovieDto['title'];
  overview: TmdbMovieDto['overview'];
  releaseDate: TmdbMovieDto['release_date'];
  rating: TmdbMovieDto['vote_average'];
  genres: string[];
  posterPath: string;
}