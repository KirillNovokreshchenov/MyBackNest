import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ErrorExceptionFilter } from './filters/error-exception.filter';
import { HttpExceptionFilter } from './filters/http-exeption.filter';
import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export const appSettings = (app: INestApplication) => {
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
};
