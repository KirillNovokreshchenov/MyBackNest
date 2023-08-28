import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import {
  ConfigType,
  getConfiguration,
} from '../../configuration/configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService<ConfigType>) {
    super();
  }
  public validate = async (username, password): Promise<boolean> => {
    if (
      this.configService.get('basic.login', { infer: true }) === username &&
      this.configService.get('basic.password', { infer: true }) === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
