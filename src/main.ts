import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api'); // Ensure the global prefix is set to 'api'

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests from your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies if needed
  });

  // Serve static files from the uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // Files will be accessible at /uploads/<filename>
  });
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
