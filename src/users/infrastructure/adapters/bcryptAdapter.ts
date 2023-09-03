import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../configuration/configuration';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

export class BcryptAdapter {
  constructor(private configService: ConfigService<ConfigType>) {}
  async hashPassword(password) {
    const saltHash = this.configService.get('SALT_HASH');
    const hash = await bcrypt.hash(password, saltHash);
    return hash;
  }
  async compare(password: string, hash: string) {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  }
  uuid() {
    return uuidv4();
  }
  addMinutes(minutes: number) {
    return add(new Date(), {
      minutes: minutes,
    });
  }
}
