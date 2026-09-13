import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Movie } from '../../movie.interface.js';

@Injectable()
export class MoviesRepository {
  private readonly filePath: string;

  constructor(private readonly configService: ConfigService) {
    const dataFile = this.configService.get<string>(
      'MOVIES_DATA_FILE',
      'data/movies.json',
    );

    this.filePath = join(process.cwd(), dataFile);
  }

  async findAll(): Promise<Movie[]> {
    const file = await readFile(this.filePath, 'utf-8');

    return JSON.parse(file) as Movie[];
  }

  async save(movies: Movie[]): Promise<void> {
    await writeFile(
      this.filePath,
      JSON.stringify(movies, null, 2),
      'utf-8',
    );
  }
}