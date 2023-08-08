import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import configuration from '../../configuration';

@Injectable()
export class JwtLikeStrategy extends PassportStrategy(Strategy, 'like') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration().secretAT,
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId };
  }
}
