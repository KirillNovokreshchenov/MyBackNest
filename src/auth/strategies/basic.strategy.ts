import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import configuration from '../../configuration';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }
  public validate = async (username, password): Promise<boolean> => {
    if (
      configuration().basic.login === username &&
      configuration().basic.password === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
