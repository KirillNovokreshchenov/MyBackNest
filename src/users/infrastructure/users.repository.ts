import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../domain/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PasswordRecovery,
  PasswordRecoveryDocument,
  PasswordRecoveryType,
} from '../../auth/domain/password-recovery.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(PasswordRecovery.name)
    private passwordRecoveryModel: PasswordRecoveryType,
  ) {}

  async findUserByCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }
  async findUserByEmailOrLogin(
    emailOrLogin: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });
  }

  async saveUser(createdUser: UserDocument) {
    await createdUser.save();
  }
  async deleteUser(id: Types.ObjectId): Promise<boolean> {
    const res = await this.UserModel.deleteOne(id);
    return res.deletedCount === 1;
  }

  async saveRecovery(pasRecovery: PasswordRecoveryDocument) {
    await pasRecovery.save();
  }

  async findRecovery(
    recoveryCode: string,
  ): Promise<PasswordRecoveryDocument | null> {
    return this.passwordRecoveryModel.findOne({ recoveryCode });
  }

  findUserById(userId: Types.ObjectId): Promise<UserDocument | null> {
    return this.UserModel.findById(userId);
  }
}
