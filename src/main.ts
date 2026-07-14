import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { exec } from 'child_process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  
  // Abre el navegador automáticamente en el Playground de GraphQL
  exec('start http://localhost:3000/graphql');
}
bootstrap();
