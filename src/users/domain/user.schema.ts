import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { EmailConfirmation, EmailConfirmationSchema } from "../../auth/domain/email-confirmation.schema";
import { BanDto } from "../application/dto/BanDto";
import { BanUserForBlogDto } from "../application/dto/BanuserForBlogDto";
import { TransformCreateUserDto } from "../application/dto/TransformCreateUserDto";
import { EmailConfirmationDto } from "../application/dto/EmailConfirmationDto";
import { IdType } from "../../models/IdType";

@Schema({ _id: false })
export class BanInfo {
  @Prop({ default: false })
  isBanned: boolean;
  @Prop({ default: null, type: Date || null })
  banDate: Date | null;
  @Prop({ default: null, type: String || null })
  banReason: string | null;
}
const BanInfoSchema = SchemaFactory.createForClass(BanInfo);
@Schema()
export class IsBannedForBlogs {
  @Prop({ required: true, type: Types.ObjectId })
  blogId: IdType | Types.ObjectId;
  @Prop({ required: true })
  banInfo: BanInfo;
}
const IsBannedForBlogsSchema = SchemaFactory.createForClass(IsBannedForBlogs);

@Schema()
export class User {
  _id: IdType;
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
  @Prop({ default: {}, type: BanInfoSchema })
  banInfo: BanInfo;
  @Prop({ default: [], type: [IsBannedForBlogsSchema] })
  isBannedForBlogs: IsBannedForBlogs[];
  // async createHash(password: string, user: UserDocument) {
  //   user.password = await UserAdapter.hashPassword(password);
  // }
  // async passwordIsValid(password: string, userHash: string): Promise<boolean> {
  //   return UserAdapter.compare(password, userHash);
  // }
  banUnbanUserForBlog(banDto: BanUserForBlogDto) {
    if (banDto.isBanned) {
      this.isBannedForBlogs.push({
        blogId: new Types.ObjectId(banDto.blogId),
        banInfo: {
          isBanned: banDto.isBanned,
          banDate: new Date(),
          banReason: banDto.banReason,
        },
      });
    } else {
      this.isBannedForBlogs = this.isBannedForBlogs.filter(
        (user) => user.blogId.toString() !== banDto.blogId,
      );
    }
  }
  userIsBannedForBlog(blogId: IdType) {
    return this.isBannedForBlogs.find(
      (user) => user.blogId.toString() === blogId.toString(),
    );
  }
  userBan(banDto: BanDto) {
    this.banInfo = { ...banDto, banDate: new Date() };
  }
  userUnban() {
    this.banInfo = {
      isBanned: false,
      banDate: null,
      banReason: null,
    };
  }
  createEmailConfirm(emailConfirm: EmailConfirmationDto) {
    this.emailConfirmation = {
      confirmationCode: emailConfirm.confirmationCode,
      expirationDate: emailConfirm.expirationDate,
      isConfirmed: emailConfirm.isConfirmed,
    };
  }
  canBeConfirmed(): boolean {
    return (
      this.emailConfirmation.expirationDate > new Date() &&
      !this.emailConfirmation.isConfirmed
    );
  }

  static createNewUser(
    userDto: TransformCreateUserDto,
    UserModel: UserModelType,
  ): UserDocument {
    return new UserModel({
      login: userDto.login,
      email: userDto.email,
      password: userDto.passwordHash,
      createdAt: new Date(),
    });
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserModelStaticType = {
  createNewUser: (
    userDto: TransformCreateUserDto,
    UserModel: UserModelType,
  ) => UserDocument;
};

UserSchema.methods = {
  createEmailConfirm: User.prototype.createEmailConfirm,
  canBeConfirmed: User.prototype.canBeConfirmed,
  userBan: User.prototype.userBan,
  userUnban: User.prototype.userUnban,
  banUnbanUserForBlog: User.prototype.banUnbanUserForBlog,
  userIsBannedForBlog: User.prototype.userIsBannedForBlog,
};

UserSchema.statics = {
  createNewUser: User.createNewUser,
};

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & UserModelStaticType;
