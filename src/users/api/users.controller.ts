import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { UserViewModel } from './view-model/UserViewModel';
import { UserViewModelAll } from './view-model/UserViewModelAll';
import { Types } from 'mongoose';
import { UserQueryInputType } from './input-model/UserQueryInputType';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async findAllUsers(
    @Query() dataQuery: UserQueryInputType,
  ): Promise<UserViewModelAll> {
    return await this.usersQueryRepository.findAllUsers(dataQuery);
  }
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserViewModel> {
    const userId = await this.usersService.createUserByAdmin(dto);
    const newUser = await this.usersQueryRepository.findUserById(userId);
    if (!newUser) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return newUser;
  }
  @Delete('/:id')
  async deleteUser(@Param('id') id: string): Promise<HttpException> {
    const userIsDeleted = await this.usersService.deleteUser(
      new Types.ObjectId(id),
    );
    if (userIsDeleted) {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }
}
