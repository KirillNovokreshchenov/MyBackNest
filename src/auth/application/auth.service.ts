import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionModelType,
} from '../../sessions/domain/session.schema';
import { DeviceRepository } from '../../sessions/infrastructure/device.repository';
import { ConfigType } from '../../configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { SessionDto } from '../../sessions/application/dto/SessionDto';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    private jwtService: JwtService,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    protected sessionRepo: DeviceRepository,
    private configService: ConfigService<ConfigType>,
  ) {}

  // async checkCredentials(loginDto: LoginDto): Promise<Types.ObjectId | null> {
  //   const user = await this.usersRepository.findUserByEmailOrLogin(
  //     loginDto.loginOrEmail,
  //   );
  //   if (!user || user.banInfo.isBanned) return null;
  //   const passwordIsValid = await user.passwordIsValid(
  //     loginDto.password,
  //     user.password,
  //   );
  //   if (!passwordIsValid) return null;
  //   return user._id;
  // }

  // async createTokens(userData: UserDataType) {
  //   const session: SessionDocument = this.SessionModel.createSession(
  //     userData,
  //     this.SessionModel,
  //   );
  //   await this.sessionRepo.saveSession(session);
  //   return this.tokens(session);
  // }

  // async newTokens(userFromRefresh: UserFromRefreshType) {
  //   const session = await this.sessionRepo.findSession(userFromRefresh);
  //   if (!session) return null;
  //   session.sessionUpdate();
  //   await this.sessionRepo.saveSession(session);
  //   return this.tokens(session);
  // }

  tokens(session: SessionDto) {
    const payloadAT = { userId: session.userId };
    const payloadRT = {
      deviceId: session.deviceId,
      userId: session.userId,
      lastActiveDate: session.lastActiveDate,
    };
    return {
      accessToken: {
        accessToken: this.jwtService.sign(payloadAT),
      },
      refreshToken: this.jwtService.sign(payloadRT, {
        secret: this.configService.get('jwt.secretRT', { infer: true }),
      }),
    };
  }

  // logout(userFromRefresh: UserFromRefreshType): Promise<boolean> {
  //   return this.sessionRepo.logout(userFromRefresh);
  // }
}
