import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import configuration from '../../configuration';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configuration().secretRT,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
      lastActiveDate: payload.lastActiveDate,
    };
  }

  private static extractJWTFromCookie(req: Request) {
    debugger;
    if (req.cookies && req.cookies.refreshToken) {
      return req.cookies.refreshToken;
    }
    return new UnauthorizedException();
  }
}
