import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function _parseOrigins(value: string | undefined, fallback: string): string[] {
  return (value ?? fallback)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function _corsOrigins(): string[] {
  return [
    ..._parseOrigins(process.env.WEB_ORIGIN, 'http://localhost:3001'),
    ..._parseOrigins(process.env.ADMIN_ORIGIN, 'http://localhost:3002'),
  ];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [...new Set(_corsOrigins())],
  });

  await app.listen(process.env.PORT ?? process.env.API_PORT ?? 3000);
}
bootstrap();
