import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { UserAdapter } from '../infrastructure/adapters/user.adapter';

@Schema()
export class User {
  _id: Types.ObjectId;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  email: string;
  @Prop({ default: new Date() })
  createdAt: Date;
  async createHash(password: string): Promise<string> {
    return UserAdapter.hashPassword(password);
  }
  static async createNewUser(
    userDto: CreateUserDto,
    UserModel: UserModelType,
  ): Promise<UserDocument> {
    const newUser = new UserModel(userDto);
    newUser.password = await newUser.createHash(newUser.password);
    return newUser;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserModelStaticType = {
  createNewUser: (
    userDto: CreateUserDto,
    UserModel: UserModelType,
  ) => Promise<UserDocument>;
};

UserSchema.methods = {
  createHash: User.prototype.createHash,
};

// const userStaticMethods: UserModelStaticType = {
//   createNewUser: User.createNewUser,
// };
UserSchema.statics = {
  createNewUser: User.createNewUser,
};

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & UserModelStaticType;
