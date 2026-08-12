import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT) || 8800;

  try {
    await app.listen(port);
  } catch (err) {
    if (err && (err as { code?: string }).code === 'EADDRINUSE') {
      console.error(
        `Erreur : le port ${port} est deja utilise par un autre processus.` +
          "\nFermez l'autre instance backend avant de relancer celle-ci.",
      );
      process.exit(1);
    }
    throw err;
  }
}

void bootstrap();
