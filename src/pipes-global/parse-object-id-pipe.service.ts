import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration/configuration';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  constructor(private configService: ConfigService<ConfigType>) {}
  transform(value: any, metadata: ArgumentMetadata): Types.ObjectId {
    if (this.configService.get('ID_TYPE') === 'MONGO') {
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
    } else {
      return value;
    }
  }
}
