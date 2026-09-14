import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs';

import { Movie, MoviesQuery } from '../../models/movie.model';
import { MoviesService } from '../../services/movies.service';
import { MovieCard } from '../../components/movie-card/movie-card';

@Component({
  selector: 'app-movies-page',
  standalone: true,
  imports: [ReactiveFormsModule, MovieCard],
  templateUrl: './movies-page.html',
})
export class MoviesPage {
  private readonly moviesService = inject(MoviesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly movies = signal<Movie[]>([]);
  readonly totalPages = signal(1);
  readonly currentPage = signal(1);

  private readonly currentPageSubject = new BehaviorSubject(1);

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly sortByControl = new FormControl<MoviesQuery['sortBy']>('title', {
    nonNullable: true,
  });

  readonly sortOrderControl = new FormControl<MoviesQuery['sortOrder']>(
    'asc',
    {
      nonNullable: true,
    },
  );

  constructor() {
    this.setupMoviesStream();
  }

  private setupMoviesStream(): void {
    const search$ = this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      map((value) => value.trim()),
      debounceTime(400),
      distinctUntilChanged(),
    );

    const sortBy$ = this.sortByControl.valueChanges.pipe(
      startWith(this.sortByControl.value),
      distinctUntilChanged(),
    );

    const sortOrder$ = this.sortOrderControl.valueChanges.pipe(
      startWith(this.sortOrderControl.value),
      distinctUntilChanged(),
    );

    combineLatest([
      search$,
      sortBy$,
      sortOrder$,
      this.currentPageSubject,
    ])
      .pipe(
        switchMap(([search, sortBy, sortOrder, page]) => {
          return this.moviesService.getMovies({
            page,
            limit: 20,
            search: search || undefined,
            sortBy,
            sortOrder,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.movies.set(response.data);
          this.totalPages.set(response.meta.totalPages);
          this.currentPage.set(response.meta.page);
        },
      });
  }

  goToNextPage(): void {
    const nextPage = this.currentPage() + 1;

    if (nextPage <= this.totalPages()) {
      this.currentPageSubject.next(nextPage);
    }
  }

  goToPreviousPage(): void {
    const previousPage = this.currentPage() - 1;

    if (previousPage >= 1) {
      this.currentPageSubject.next(previousPage);
    }
  }

  resetPage(): void {
  if (this.currentPage() !== 1) {
    this.currentPageSubject.next(1);
  }
}
}