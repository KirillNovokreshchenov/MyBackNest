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
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { EmailConfirmDataType } from '../../auth/application/types/EmailConfirmDataType';
import { RecoveryDataType } from '../../auth/application/types/RecoveryDataType';

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

  async findUserLogin(userId: IdType) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    return user.login;
  }

  async isBannedForBlog(ownerBlogId: IdType, userId: IdType) {
    const user = await this.findUserById(userId);
    const isBanned = user!.userIsBannedForBlog(ownerBlogId);
    if (isBanned) return true;
    return false;
  }

  async findUserId(userId: IdType) {
    const user = await this.findUserById(userId);
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    return user._id;
  }
}

@Injectable()
export class UsersSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findUserId(userId: IdType) {
    try {
      const user = await this.dataSource.query(
        `
      SELECT user_id
      FROM public.users
WHERE user_id = $1 ;
      `,
        [userId],
      );
      return user[0].user_id;
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }
  async createUser(transformDto: TransformCreateUserDto) {
    const user = await this.dataSource.query(
      `
INSERT INTO public.users(
login, email, password)
VALUES ($1, $2, $3)
RETURNING user_id;`,
      [transformDto.login, transformDto.email, transformDto.passwordHash],
    );
    return user[0].user_id;
  }

  async createEmailConfirmation(
    userId: IdType,
    emailConfirm: EmailConfirmationDto,
  ) {
    try {
      await this.dataSource.query(
        `
    INSERT INTO public.email_confirmation(
user_id, confirmation_code, expiration_date, is_confirmed)
VALUES ($1, $2, $3, $4);`,
        [
          userId,
          emailConfirm.confirmationCode,
          emailConfirm.expirationDate,
          emailConfirm.isConfirmed,
        ],
      );
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async deleteUser(id: IdType): Promise<boolean> {
    try {
      const res = await this.dataSource.query(
        `WITH blogs_update as (update blogs
SET is_deleted = true
WHERE owner_id = $1),
posts_update as (
update posts
SET is_deleted = true
WHERE owner_id = $1), comments_update as (update comments
SET is_deleted = true
WHERE owner_id = $1)
update users 
SET is_deleted = true
Where user_id = $1;`,
        [id],
      );
      return res[1] === 1;
    } catch {
      return false;
    }
  }

  async findEmailConfirmDataByCode(
    code: string,
  ): Promise<EmailConfirmDataType | RESPONSE_ERROR> {
    const user = await this.dataSource.query(
      `
    SELECT user_id as "userId", expiration_date as "expDate", is_confirmed as "isConfirmed"
FROM public.email_confirmation
WHERE confirmation_code = $1;
    `,
      [code],
    );
    if (!user[0]) return RESPONSE_ERROR.BAD_REQUEST;
    return user[0];
  }

  async emailConfirmed(userId: IdType) {
    try {
      await this.dataSource.query(
        `
      UPDATE public.email_confirmation
SET  is_confirmed= true
WHERE user_id = $1;
      `,
        [userId],
      );
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }

  async findDataConfirmedByEmail(
    email: string,
  ): Promise<EmailConfirmDataType | RESPONSE_ERROR> {
    try {
      const user = await this.dataSource.query(
        `
    SELECT user_id, confirmation_code, expiration_date, is_confirmed, email
FROM public.email_confirmation
LEFT JOIN users USING(user_id)
WHERE email = $1
ORDER BY is_confirmed desc
LIMIT 1
    `,
        [email],
      );
      return {
        userId: user[0].user_id,
        expDate: user[0].expiration_date,
        isConfirmed: user[0].is_confirmed,
      };
    } catch (e) {
      return RESPONSE_ERROR.BAD_REQUEST;
    }
  }

  async findUserByEmailOrLogin(emailOrLogin: string) {
    try {
      const user = await this.dataSource.query(
        `
      SELECT user_id
      FROM public.users
WHERE login = $1 OR email = $1;
      `,
        [emailOrLogin],
      );
      return user[0].user_id;
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }

  async createRecovery(recoveryPas: RecoveryPasswordDto) {
    await this.dataSource.query(
      `
    INSERT INTO public.recovery_password(
user_id, recovery_code, expiration_date)
VALUES ($1, $2, $3);
    `,
      [
        recoveryPas.userId,
        recoveryPas.recoveryCode,
        recoveryPas.expirationDate,
      ],
    );
  }

  async findRecovery(recoveryCode: string) {
    const recovery = await this.dataSource.query(
      `
      SELECT user_id as "userId", recovery_code as "recCode", expiration_date as "expDate"
      FROM public.recovery_password
      WHERE recovery_code = $1;
      `,
      [recoveryCode],
    );
    if (!recovery[0]) return RESPONSE_ERROR.BAD_REQUEST;
    return recovery[0];
  }
  async newPass(userId: IdType, newPass: string) {
    try {
      await this.dataSource.query(
        `
      UPDATE public.users
SET password= $2
WHERE user_id = $1;
      `,
        [userId, newPass],
      );
      return RESPONSE_SUCCESS.NO_CONTENT;
    } catch (e) {
      return RESPONSE_ERROR.SERVER_ERROR;
    }
  }
  async findUserDataCheckCredentials(loginOrEmail: string) {
    try {
      const user = await this.dataSource.query(
        `
      SELECT user_id, password
      FROM public.users
WHERE login = $1 OR email = $1;
      `,
        [loginOrEmail],
      );

      return {
        userId: user[0].user_id,
        hashPassword: user[0].password,
        isBanned: false,
      };
    } catch (e) {
      return null;
    }
  }
}
