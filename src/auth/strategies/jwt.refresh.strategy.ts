import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { ConfigType } from "../../configuration/configuration";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService<ConfigType>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secretRT', { infer: true }),
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
    if (req.cookies && req.cookies.refreshToken) {
      return req.cookies.refreshToken;
    }
    return new UnauthorizedException();
  }
}
