import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';

@ValidatorConstraint({ name: 'LoginExists', async: true })
@Injectable()
export class LoginExistsRule implements ValidatorConstraintInterface {
  constructor(private usersRepo: UsersRepository) {}

  async validate(value: string) {
    const userId = await this.usersRepo.findUserByEmailOrLogin(value);
    if (userId === RESPONSE_ERROR.NOT_FOUND) return true;
    return false;
  }
  defaultMessage() {
    return `Incorrect Login`;
  }
}
