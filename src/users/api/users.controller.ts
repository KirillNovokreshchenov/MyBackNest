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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { UserViewModel } from './view-model/UserViewModel';
import { UserViewModelAll } from './view-model/UserViewModelAll';
import { Types } from 'mongoose';
import { UserQueryInputType } from './input-model/UserQueryInputType';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async findAllUsers(
    @Query() dataQuery: UserQueryInputType,
  ): Promise<UserViewModelAll> {
    return await this.usersQueryRepository.findAllUsers(dataQuery);
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserViewModel> {
    const userId = await this.usersService.createUserByAdmin(dto);
    const newUser = await this.usersQueryRepository.findUserById(userId);
    if (!newUser) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return newUser;
  }
  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deleteUser(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ): Promise<HttpException> {
    const userIsDeleted = await this.usersService.deleteUser(id);
    if (userIsDeleted) {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }
}
