import { RESPONSE_OPTIONS } from '../models/ResponseOptionsEnum';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export function switchError(error: RESPONSE_OPTIONS) {
  switch (error) {
    case RESPONSE_OPTIONS.NOT_FOUND:
      throw new NotFoundException();
    case RESPONSE_OPTIONS.FORBIDDEN:
      throw new ForbiddenException();
    case RESPONSE_OPTIONS.NO_CONTENT:
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }
}
