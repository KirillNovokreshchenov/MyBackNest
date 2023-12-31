import { Injectable } from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../domain/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  PasswordRecovery,
  PasswordRecoveryDocument,
  PasswordRecoveryType,
} from '../../auth/domain/password-recovery.schema';
import { TransformCreateUserDto } from '../application/dto/TransformCreateUserDto';
import { IdType } from '../../models/IdType';
import { EmailConfirmationDto } from '../application/dto/EmailConfirmationDto';
import { RecoveryPasswordDto } from '../application/dto/RecoveryPasswordDto';
import { BanDto } from '../application/dto/BanDto';
import { BanUserForBlogDto } from '../application/dto/BanuserForBlogDto';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { EmailConfirmDataType } from '../application/types/EmailConfirmDataType';
import { RecoveryDataType } from '../application/types/RecoveryDataType';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(PasswordRecovery.name)
    private passwordRecoveryModel: PasswordRecoveryType,
  ) {}

  async findEmailConfirmDataByCode(
    code: string,
  ): Promise<EmailConfirmDataType | RESPONSE_ERROR> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    if (!user) return RESPONSE_ERROR.BAD_REQUEST;
    return {
      userId: user._id,
      expDate: user.emailConfirmation.expirationDate,
      isConfirmed: user.emailConfirmation.isConfirmed,
    };
  }
  async findUserByEmailOrLogin(emailOrLogin: string) {
    const user = await this.UserModel.findOne({
      $or: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    return user._id;
  }

  async saveUser(createdUser: UserDocument) {
    await createdUser.save();
  }
  async deleteUser(id: IdType): Promise<RESPONSE_SUCCESS | RESPONSE_ERROR> {
    const res = await this.UserModel.deleteOne({ _id: id });
    if (res.deletedCount === 0) return RESPONSE_ERROR.SERVER_ERROR;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async saveRecovery(pasRecovery: PasswordRecoveryDocument) {
    await pasRecovery.save();
  }

  async findRecovery(
    recoveryCode: string,
  ): Promise<RecoveryDataType | RESPONSE_ERROR> {
    const recovery = await this.passwordRecoveryModel.findOne({ recoveryCode });
    if (!recovery) return RESPONSE_ERROR.BAD_REQUEST;
    return {
      userId: recovery.userId,
      recCode: recovery.recoveryCode,
      expDate: recovery.expirationDate,
    };
  }

  findUserById(userId: IdType): Promise<UserDocument | null> {
    return this.UserModel.findById(userId);
  }

  async createUser(transformDto: TransformCreateUserDto) {
    const newUser: UserDocument = this.UserModel.createNewUser(
      transformDto,
      this.UserModel,
    );
    await this.saveUser(newUser);
    return newUser._id;
  }

  async createEmailConfirmation(
    userId: IdType,
    emailConfirm: EmailConfirmationDto,
  ) {
    const user = await this.findUserById(userId);
    if (!user) return RESPONSE_ERROR.SERVER_ERROR;
    user.createEmailConfirm(emailConfirm);
    await this.saveUser(user);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async findDataConfirmedByEmail(
    email: string,
  ): Promise<EmailConfirmDataType | RESPONSE_ERROR> {
    const user = await this.UserModel.findOne({ email: email });
    if (!user) return RESPONSE_ERROR.SERVER_ERROR;
    return {
      userId: user._id,
      expDate: user.emailConfirmation.expirationDate,
      isConfirmed: user.emailConfirmation.isConfirmed,
    };
  }

  async findUserDataCheckCredentials(loginOrEmail: string) {
    const user = await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) return null;
    return {
      userId: user._id,
      hashPassword: user.password,
      isBanned: user.banInfo.isBanned,
    };
  }

  async createRecovery(recoveryPas: RecoveryPasswordDto) {
    const recovery = this.passwordRecoveryModel.createRecovery(
      this.passwordRecoveryModel,
      recoveryPas,
    );
    await this.saveRecovery(recovery);
  }

  async newPass(userId: IdType, newPass: string) {
    const user = await this.findUserById(userId);
    if (!user) return RESPONSE_ERROR.SERVER_ERROR;
    user.password = newPass;
    await this.saveUser(user);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async emailConfirmed(userId: IdType) {
    const user = await this.findUserById(userId);
    if (!user) return RESPONSE_ERROR.SERVER_ERROR;
    user.emailConfirmation.isConfirmed = true;
    await this.saveUser(user);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async banStatus(userId: IdType) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    return {
      isBanned: user.banInfo.isBanned,
    };
  }

  async userBan(userId: IdType, banDto: BanDto) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    user.userBan(banDto);
    await this.saveUser(user);
  }

  async userUnban(userId: IdType) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    user.userUnban();
    await this.saveUser(user);
  }

  async banUnbanUserForBlog(userId: IdType, banDto: BanUserForBlogDto) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    user.banUnbanUserForBlog(banDto);
    await this.saveUser(user);
  }

  // async findUserLogin(userId: IdType) {
  //   const user = await this.findUserById(userId);
  //   if (!user) return null;
  //   return user.login;
  // }
  //
  // async isBannedForBlog(ownerBlogId: IdType, userId: IdType) {
  //   const user = await this.findUserById(userId);
  //   const isBanned = user!.userIsBannedForBlog(ownerBlogId);
  //   if (isBanned) return true;
  //   return false;
  // }

  async findUserId(userId: IdType) {
    const user = await this.findUserById(userId);
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    return user._id;
  }
}
