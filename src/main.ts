import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './configuration';
import { HttpExceptionFilter } from './filters/http-exeption.filter';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorExceptionFilter } from './filters/error-exception.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsResponse: { message: string; field: string }[] = [];

        errors.forEach((error: ValidationError) => {
          if (error.constraints) {
            const constrainKey = Object.values(error.constraints);
            errorsResponse.push({
              message: constrainKey[0],
              field: error.property,
            });
          }
        });
        throw new BadRequestException(errorsResponse);
      },
    }),
  );
  await app.listen(configuration().port);
}
bootstrap();
