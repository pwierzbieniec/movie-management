import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'movies',
    loadComponent: () =>
      import('./features/movies/pages/movies-page/movies-page').then(
        (m) => m.MoviesPage,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'movies',
  },
  {
    path: '**',
    redirectTo: 'movies',
  },
];