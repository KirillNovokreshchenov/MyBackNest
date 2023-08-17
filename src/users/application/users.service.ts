import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from './dto/CreateUserDto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.schema';
import { Types } from 'mongoose';
import { EmailManagers } from '../../auth/application/managers/email.managers';
import { CodeDto } from './dto/CodeDto';
import { EmailDto } from './dto/EmailDto';
import {
  PasswordRecovery,
  PasswordRecoveryType,
} from '../../auth/domain/password-recovery.schema';
import { NewPasswordDto } from '../../auth/application/dto/NewPasswordDto';
import { BanDto } from './dto/BanDto';
import { DeviceRepository } from '../../sessions/infrastructure/device.repository';
import { PostModelType } from '../../posts/domain/post.schema';
import { CommentModelType } from '../../comments/domain/comment.schema';
import { PostLikeModelType } from '../../posts/domain/post-like.schema';
import { CommentLikeModelType } from '../../comments/domain/comment-like.schema';

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailManagers,
    protected deviceRepo: DeviceRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(User.name) private PostModel: PostModelType,
    @InjectModel(User.name) private CommentModel: CommentModelType,
    @InjectModel(User.name) private PostLikeModel: PostLikeModelType,
    @InjectModel(User.name) private CommentLikeModel: CommentLikeModelType,
    @InjectModel(PasswordRecovery.name)
    private passwordRecoveryModel: PasswordRecoveryType,
  ) {}

  async createUserByRegistration(userDto: CreateUserDto): Promise<boolean> {
    const newUser: UserDocument = await this.UserModel.createNewUser(
      userDto,
      this.UserModel,
    );
    newUser.createEmailConfirm();
    try {
      await this.emailManager.emailRegistration(newUser);
    } catch {
      return false;
    }
    await this.usersRepository.saveUser(newUser);
    return true;
  }

  async confirmByEmail(codeDto: CodeDto): Promise<boolean> {
    const user = await this.usersRepository.findUserByCode(codeDto.code);
    if (!user) return false;
    if (user.canBeConfirmed()) {
      user.emailConfirmation.isConfirmed = true;
      await this.usersRepository.saveUser(user);
      return true;
    } else {
      return false;
    }
  }

  async emailResending(emailDto: EmailDto) {
    const user = await this.usersRepository.findUserByEmailOrLogin(
      emailDto.email,
    );
    if (!user || user.emailConfirmation.isConfirmed) return false;
    user.createEmailConfirm();
    try {
      await this.emailManager.emailRegistration(user);
    } catch {
      return false;
    }
    await this.usersRepository.saveUser(user);
    return true;
  }

  async recoveryPassword(emailDto: EmailDto) {
    const user = await this.usersRepository.findUserByEmailOrLogin(
      emailDto.email,
    );
    if (!user) return;
    const pasRecovery = await this.passwordRecoveryModel.createRecovery(
      this.passwordRecoveryModel,
      emailDto.email,
    );

    try {
      await this.emailManager.passwordRecovery(
        emailDto.email,
        pasRecovery.recoveryCode,
      );
    } catch {
      return;
    }
    await this.usersRepository.saveRecovery(pasRecovery);
  }

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

  async newPassword(newPasswordDto: NewPasswordDto) {
    const pasRecovery = await this.usersRepository.findRecovery(
      newPasswordDto.recoveryCode,
    );
    if (!pasRecovery) return false;
    const user = await this.usersRepository.findUserByEmailOrLogin(
      pasRecovery.email,
    );
    if (!user) return false;
    if (pasRecovery.canBeRecovery(newPasswordDto.recoveryCode)) {
      await user.createHash(newPasswordDto.newPassword, user);
      await this.usersRepository.saveUser(user);
      return true;
    } else {
      return false;
    }
  }

  async userBan(userId: Types.ObjectId, banDto: BanDto) {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) return false;
    user.userBan(banDto);
    await this.usersRepository.saveUser(user);
    await this.deviceRepo.deleteAllSessionsBan(userId);
    return true;
  }
  async _banPostsUser(userId: Types.ObjectId) {}
  async _banCommentsUser(userId: Types.ObjectId) {}
  async _banLikesUser(userId: Types.ObjectId) {}
}
