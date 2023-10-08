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
import { User } from '../application/entities-typeorm/user.entity';

@Injectable()
export class UsersTypeORMRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User) protected usersRepo: Repository<User>,
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

  async deleteUser(userId: string): Promise<RESPONSE_SUCCESS> {
    await this.usersRepo.update(userId, { isDeleted: true });
    return RESPONSE_SUCCESS.NO_CONTENT;
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
    const user = await this.usersRepo.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });
    if (!user) return RESPONSE_ERROR.NOT_FOUND;
    return user.userId;
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
