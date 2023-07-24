import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from './dto/CreateUserDto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async createUserByAdmin(userDto: CreateUserDto): Promise<Types.ObjectId> {
    const newUser: UserDocument = await this.UserModel.createNewUser(
      userDto,
      this.UserModel,
    );
    await this.usersRepository.saveUser(newUser);
    return newUser._id;
  }

  async deleteUser(id: Types.ObjectId): Promise<boolean> {
    return this.usersRepository.deleteUser(id);
  }
}
