import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): Types.ObjectId {
    if (typeof value === 'object') {
      try {
        for (const key in value) {
          value[key] = new Types.ObjectId(value[key]);
        }
        return value;
      } catch {
        throw new NotFoundException();
      }
    }
    try {
      return new Types.ObjectId(value);
    } catch {
      throw new NotFoundException();
    }
  }
}
