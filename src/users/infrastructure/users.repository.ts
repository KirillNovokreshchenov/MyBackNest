import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../domain/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async saveUser(createdUser: UserDocument) {
    await createdUser.save();
  }
  async deleteUser(id: Types.ObjectId): Promise<boolean> {
    const res = await this.userModel.deleteOne(id);
    return res.deletedCount === 1;
  }
}
