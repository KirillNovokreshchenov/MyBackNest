import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/loginDto';
import { Types } from 'mongoose';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { UserDataType } from '../api/input-model/user-data-request.type';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../../sessions/domain/session.schema';
import { DeviceRepository } from '../../sessions/infrastructure/device.repository';
import configuration from '../../configuration';
import { UserFromRefreshType } from '../api/input-model/user-from-refresh.type';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    private jwtService: JwtService,
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    protected sessionRepo: DeviceRepository,
  ) {}

  async checkCredentials(loginDto: LoginDto): Promise<Types.ObjectId | null> {
    const user = await this.usersRepository.findUserByEmailOrLogin(
      loginDto.loginOrEmail,
    );
    if (!user || user.banInfo) return null;
    const passwordIsValid = await user.passwordIsValid(
      loginDto.password,
      user.password,
    );
    if (!passwordIsValid) return null;
    return user._id;
  }

  async createTokens(userData: UserDataType) {
    const session: SessionDocument = this.SessionModel.createSession(
      userData,
      this.SessionModel,
    );
    await this.sessionRepo.saveSession(session);
    return this.tokens(session);
  }

  async newTokens(userFromRefresh: UserFromRefreshType) {
    const session = await this.sessionRepo.findSession(userFromRefresh);
    if (!session) return null;
    session.sessionUpdate();
    await this.sessionRepo.saveSession(session);
    return this.tokens(session);
  }

  tokens(session: SessionDocument) {
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
        secret: configuration().secretRT,
      }),
    };
  }

  logout(userFromRefresh: UserFromRefreshType): Promise<boolean> {
    return this.sessionRepo.logout(userFromRefresh);
  }
}
