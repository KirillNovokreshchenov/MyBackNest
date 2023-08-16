import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../application/auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
      passReqToCallback: true,
    });
  }
  async validate(
    req: Request,
    loginOrEmail: string,
    password: string,
  ): Promise<any> {
    const userId = await this.authService.checkCredentials({
      loginOrEmail,
      password,
    });
    if (!userId) {
      throw new UnauthorizedException();
    }
    const userData = {
      userId,
      ip: req.headers['x-forwarded-for'] ?? req.ip,
      deviceName: req.headers['user-agent'],
    };
    return userData;
  }
}
