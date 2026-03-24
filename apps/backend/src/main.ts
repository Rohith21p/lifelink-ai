import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'https://lifelink-ai.vercel.app',
      'https://lifelink-jmird1oia-rohithvenki21-9523s-projects.vercel.app',
    ],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LifeLink AI API')
    .setDescription('Healthcare coordination system')
    .setVersion('2.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

bootstrap();
