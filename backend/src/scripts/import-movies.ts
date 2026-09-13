import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { MovieImporterService } from '../tmdb/movie-importer.service.js';

async function bootstrap() {
  const pagesArgument = process.argv[2];
  const pages = pagesArgument ? Number(pagesArgument) : 10;

  if (!Number.isInteger(pages) || pages < 1 || pages > 25) {
    console.error('Pages must be an integer between 1 and 25.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const importer = app.get(MovieImporterService);

    console.log(`Importing movies from TMDB (${pages} pages)...`);

    const result = await importer.importMovies(pages);

    console.log(`Imported: ${result.imported} movies`);
    console.log(`Pages: ${result.pages}`);
  } catch (error) {
    console.error('Movie import failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();