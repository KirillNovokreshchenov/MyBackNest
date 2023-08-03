import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string): Types.ObjectId {
    try {
      return new Types.ObjectId(value);
    } catch {
      throw new NotFoundException();
    }
  }
}
