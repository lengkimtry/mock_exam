import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable transformation
    }),
  ); // Enable validation globally

  const configService = app.get(ConfigService);
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  app.enableCors({
    origin: frontendUrl, // Explicitly allow the frontend's origin
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('MES API Documentation')
    .setDescription('API information')
    .setVersion('1.0')
    .addTag('money')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') || 4000;

  await app.listen(port);
  console.log(`🚀 Backend running at: http://localhost:${port}`);
  console.log(`🌐 CORS allowed for: ${frontendUrl}`);
}

bootstrap();
