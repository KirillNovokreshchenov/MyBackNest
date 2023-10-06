import { RESPONSE_ERROR } from '../models/RESPONSE_ERROR';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const switchError = (
  error: RESPONSE_ERROR,
  badReqMes?: [{ message: string; field: string }],
) => {
  switch (error) {
    case RESPONSE_ERROR.NOT_FOUND:
      throw new NotFoundException();
    case RESPONSE_ERROR.FORBIDDEN:
      throw new ForbiddenException();
    // case RESPONSE_ERROR.NO_CONTENT:
    //   throw new HttpException('No content', HttpStatus.NO_CONTENT);
    case RESPONSE_ERROR.SERVER_ERROR:
      throw new InternalServerErrorException();
    case RESPONSE_ERROR.UNAUTHORIZED:
      throw new UnauthorizedException();
    case RESPONSE_ERROR.BAD_REQUEST:
      throw new BadRequestException(badReqMes);
  }
};
