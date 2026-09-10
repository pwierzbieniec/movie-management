import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

    app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
  .setTitle('Movie Management API')
  .setDescription('REST API for the Movie Management application')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);

SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
}
await bootstrap();
