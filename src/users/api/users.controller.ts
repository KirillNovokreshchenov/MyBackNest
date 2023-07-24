import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryRepository } from './users.query.repository';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  @Post()
  async createUser(@Body() dto) {
    // const userObjectId = await this.usersService.createUserByAdmin();
    // const newUser = await this.usersQueryRepository.findUser(userObjectId);
    // return newUser;
  }
}
