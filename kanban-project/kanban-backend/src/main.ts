import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS
  app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:3000', 'http://localhost', 'http://localhost:80'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Connection', 'Upgrade'],
    credentials: true
  }));

  await app.listen(3001);
  console.log('Application is running on: http://localhost:3001');
}
bootstrap();
