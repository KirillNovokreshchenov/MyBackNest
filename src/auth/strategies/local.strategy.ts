import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Request } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { CheckCredentialsCommand } from "../application/use-cases/check-credentials-use-case";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
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
    const userId = await this.commandBus.execute(
      new CheckCredentialsCommand({
        loginOrEmail,
        password,
      }),
    );
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
