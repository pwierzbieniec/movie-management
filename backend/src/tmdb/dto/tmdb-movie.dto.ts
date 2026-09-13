export interface TmdbMovieDto {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
  genre_ids: number[];
}

export interface TmdbMovieListResponseDto {
  page: number;
  results: TmdbMovieDto[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenreDto {
  id: number;
  name: string;
}

export interface TmdbGenreListResponseDto {
  genres: TmdbGenreDto[];
}