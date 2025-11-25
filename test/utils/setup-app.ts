import { INestApplication, ValidationPipe, HttpException } from '@nestjs/common';
import { AppExceptionFilter } from '../../src/common/filters/app-exception.filter';

export function configureE2eApp(app: INestApplication) {
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
    }),
  );
}
