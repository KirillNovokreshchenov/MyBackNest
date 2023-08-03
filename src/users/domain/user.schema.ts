import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { UserAdapter } from '../infrastructure/adapters/user.adapter';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from '../../auth/domain/email-confirmation.schema';

@Schema()
export class User {
  _id: Types.ObjectId;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ type: EmailConfirmationSchema, required: false })
  emailConfirmation: EmailConfirmation;

  async createHash(password: string, user: UserDocument) {
    user.password = await UserAdapter.hashPassword(password);
  }
  async passwordIsValid(password: string, userHash: string): Promise<boolean> {
    return UserAdapter.compare(password, userHash);
  }

  createEmailConfirm() {
    this.emailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        minutes: 60,
      }),
      isConfirmed: false,
    };
  }
  canBeConfirmed(): boolean {
    return (
      this.emailConfirmation.expirationDate > new Date() &&
      !this.emailConfirmation.isConfirmed
    );
  }

  static async createNewUser(
    userDto: CreateUserDto,
    UserModel: UserModelType,
    emailConfirm?: EmailConfirmation,
  ): Promise<UserDocument> {
    const newUser = new UserModel({
      ...userDto,
      createdAt: new Date(),
      emailConfirm,
    });
    await newUser.createHash(newUser.password, newUser);
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
  createEmailConfirm: User.prototype.createEmailConfirm,
  canBeConfirmed: User.prototype.canBeConfirmed,
  passwordIsValid: User.prototype.passwordIsValid,
};

UserSchema.statics = {
  createNewUser: User.createNewUser,
};

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & UserModelStaticType;
