import { NestFactory } from '@nestjs/core';
import { HttpException, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  app.enableCors();
  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const formatted = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));
        return new HttpException(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: formatted,
            },
          },
          400,
        );
      },
    }) as ValidationPipe,
  );

  const config = new DocumentBuilder()
    .setTitle('Movie Discovery Service')
    .setDescription('API for the movie discovery take-home project')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const prismaService = app.get(PrismaService);
  process.on('beforeExit', async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
