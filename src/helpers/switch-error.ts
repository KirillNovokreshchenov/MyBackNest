import { RESPONSE_ERROR } from '../models/RESPONSE_ERROR';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export const switchError = (error: RESPONSE_ERROR) => {
  switch (error) {
    case RESPONSE_ERROR.NOT_FOUND:
      throw new NotFoundException();
    case RESPONSE_ERROR.FORBIDDEN:
      throw new ForbiddenException();
    // case RESPONSE_ERROR.NO_CONTENT:
    //   throw new HttpException('No content', HttpStatus.NO_CONTENT);
    case RESPONSE_ERROR.SERVER_ERROR:
      throw new InternalServerErrorException();
  }
};
