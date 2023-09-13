import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';

@ValidatorConstraint({ name: 'EmailExists', async: true })
@Injectable()
export class EmailExistsRule implements ValidatorConstraintInterface {
  constructor(private usersRepo: UsersRepository) {}

  async validate(value: string) {
    const userId = await this.usersRepo.findUserByEmailOrLogin(value);
    if (userId) return false;
    return true;
  }
  defaultMessage() {
    return `Incorrect Email`;
  }
}
