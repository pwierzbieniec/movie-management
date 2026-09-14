import { Component, input } from '@angular/core';

import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  templateUrl: './movie-card.html',
})
export class MovieCard {
  readonly movie = input.required<Movie>();
}