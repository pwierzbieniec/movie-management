import { Injectable } from '@nestjs/common';
import { join } from 'node:path';
import { readFile } from 'fs/promises';
import { Movie } from '../movie.interface.js';

@Injectable()
export class MoviesService {
    async findAll(): Promise<Movie[]> {
        const filePath = join(process.cwd(), 'data', 'movies.json');
        const file = await readFile(filePath, 'utf-8');

        return JSON.parse(file) as Movie[];
    }
}
