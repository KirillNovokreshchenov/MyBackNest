import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IdType } from '../../models/IdType';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { TransformCreateUserDto } from '../application/dto/TransformCreateUserDto';
import { EmailConfirmationDto } from '../application/dto/EmailConfirmationDto';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { EmailConfirmDataType } from '../application/types/EmailConfirmDataType';
import { RecoveryPasswordDto } from '../application/dto/RecoveryPasswordDto';
import { User } from '../domain/entities-typeorm/user.entity';
import { EmailConfirmation } from '../domain/entities-typeorm/email-confirm.entity';
import { RecoveryPassword } from '../domain/entities-typeorm/recovery-password.entity';

@Injectable()
export class UsersTypeORMRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User) protected usersRepo: Repository<User>,
    @InjectRepository(EmailConfirmation)
    protected emailConfirmRepo: Repository<EmailConfirmation>,
    @InjectRepository(RecoveryPassword)
    protected recoveryPassRepo: Repository<RecoveryPassword>,
  ) {}
  async findUserId(userId: string): Promise<IdType | RESPONSE_ERROR> {
    const user = await this.usersRepo.findOneBy({ userId });
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    return user.userId;
  }
  async createUser(transformDto: TransformCreateUserDto) {
    const user = new User();
    user.login = transformDto.login;
    user.email = transformDto.email;
    user.password = transformDto.passwordHash;
    await this.usersRepo.save(user);
    return user.userId;
  }

  async createEmailConfirmation(
    userId: string,
    emailConfirm: EmailConfirmationDto,
  ) {
    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.userId = userId;
    emailConfirmation.confirmationCode = emailConfirm.confirmationCode;
    emailConfirmation.expirationDate = emailConfirm.expirationDate;
    emailConfirmation.isConfirmed = emailConfirm.isConfirmed;
    await this.emailConfirmRepo.save(emailConfirmation);
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async deleteUser(userId: string): Promise<RESPONSE_SUCCESS> {
    await this.usersRepo.update(userId, { isDeleted: true });
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async findEmailConfirmDataByCode(
    code: string,
  ): Promise<EmailConfirmDataType | RESPONSE_ERROR> {
    const emailConfirm = await this.emailConfirmRepo.findOneBy({
      confirmationCode: code,
    });
    if (!emailConfirm) return RESPONSE_ERROR.BAD_REQUEST;
    return {
      userId: emailConfirm.userId,
      isConfirmed: emailConfirm.isConfirmed,
      expDate: emailConfirm.expirationDate,
    };
  }

  async emailConfirmed(userId: IdType) {
    await this.emailConfirmRepo.update(userId, { isConfirmed: true });
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async findDataConfirmedByEmail(
    email: string,
  ): Promise<EmailConfirmDataType | RESPONSE_ERROR> {
    const emailConfirm = await this.emailConfirmRepo.findOne({
      relations: { user: true },
      where: { user: { email: email } },
    });
    if (!emailConfirm) return RESPONSE_ERROR.BAD_REQUEST;
    return {
      userId: emailConfirm.userId,
      isConfirmed: emailConfirm.isConfirmed,
      expDate: emailConfirm.expirationDate,
    };
  }

  async findUserByEmailOrLogin(emailOrLogin: string) {
    const user = await this.usersRepo.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    return user.userId;
  }

  async createRecovery(recoveryPas: RecoveryPasswordDto) {
    const newRecoveryPas = new RecoveryPassword();
    newRecoveryPas.userId = recoveryPas.userId.toString();
    newRecoveryPas.recoveryCode = recoveryPas.recoveryCode;
    newRecoveryPas.expirationDate = recoveryPas.expirationDate;
    await this.recoveryPassRepo.save(newRecoveryPas);
  }

  async findRecovery(recoveryCode: string) {
    const recovery = await this.recoveryPassRepo.findOneBy({
      recoveryCode: recoveryCode,
    });
    if (!recovery) return RESPONSE_ERROR.BAD_REQUEST;
    return {
      userId: recovery.userId,
      recCode: recovery.recoveryCode,
      expDate: recovery.expirationDate,
    };
  }
  async newPass(userId: IdType, newPass: string) {
    await this.usersRepo.update(userId, { password: newPass });
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
  async findUserDataCheckCredentials(emailOrLogin: string) {
    const user = await this.usersRepo.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });
    if (!user) return null;
    return {
      userId: user.userId,
      hashPassword: user.password,
      isBanned: false,
    };
  }
}
