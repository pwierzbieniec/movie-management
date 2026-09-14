export interface Movie {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  rating: number;
  genres: string[];
  posterPath: string;
}

export interface MoviesQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'rating' | 'releaseDate';
  sortOrder?: 'asc' | 'desc';
  genre?: string;
}

export interface MoviesResponse {
  data: Movie[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}