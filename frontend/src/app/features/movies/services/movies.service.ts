import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Movie,
  MoviesQuery,
  MoviesResponse,
} from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/movies';

  getMovies(query: MoviesQuery = {}): Observable<MoviesResponse> {
    let params = new HttpParams();

    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }

    if (query.limit !== undefined) {
      params = params.set('limit', query.limit);
    }

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    if (query.sortOrder) {
      params = params.set('sortOrder', query.sortOrder);
    }

    if (query.genre) {
      params = params.set('genre', query.genre);
    }

    return this.http.get<MoviesResponse>(this.apiUrl, { params });
  }

  getMovie(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/${id}`);
  }
}