import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';

type ErrorsResponse = {
  errorsMessages: { message: string; field: string }[];
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    console.log(exception.getResponse());

    if (status === 400) {
      const errorsResponse: ErrorsResponse = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();
      responseBody.message.forEach((m) =>
        errorsResponse.errorsMessages.push(m),
      );
      response.status(status).json(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
