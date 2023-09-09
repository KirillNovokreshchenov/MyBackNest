import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { Types } from 'mongoose';
import { UsersRepository } from '../infrastructure/users.repository';

@ValidatorConstraint({ name: 'LoginExists', async: true })
@Injectable()
export class LoginExistsRule implements ValidatorConstraintInterface {
  constructor(private usersRepo: UsersRepository) {}

  async validate(value: string) {
    const userId = await this.usersRepo.findUserByEmailOrLogin(value);
    if (userId) return false;
    return true;
  }
  defaultMessage() {
    return `Incorrect Login`;
  }
}
