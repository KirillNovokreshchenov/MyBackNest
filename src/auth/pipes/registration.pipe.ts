import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { CreateUserDto } from "../../users/application/dto/CreateUserDto";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserModelType } from "../../users/domain/user.schema";

@Injectable()
export class RegistrationPipe implements PipeTransform {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async transform(userDto: CreateUserDto) {
    const messageError: { message: string; field: string }[] = [];
    const userByLogin = await this.UserModel.findOne({
      login: userDto.login,
    }).lean();
    if (userByLogin) {
      messageError.push({ message: 'incorrect login', field: 'login' });
    }
    const userByEmail = await this.UserModel.findOne({
      email: userDto.email,
    }).lean();
    if (userByEmail) {
      messageError.push({ message: 'incorrect email', field: 'email' });
    }
    if (messageError.length > 0) throw new BadRequestException(messageError);
    return userDto;
  }
}
