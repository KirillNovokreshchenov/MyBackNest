import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { Types } from 'mongoose';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { UsersService } from '../application/users.service';
import { BanDto } from '../application/dto/BanDto';
import { UserQueryInputType } from './input-model/UserQueryInputType';
import { UserViewModelAll } from './view-model/UserViewModelAll';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { UserViewModel } from './view-model/UserViewModel';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class SaUsersController {
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
  @Put(':id/ban')
  async userBan(
    @Param('id', ParseObjectIdPipe) userId: Types.ObjectId,
    @Body() banDto: BanDto,
  ) {
    const isBanned = await this.usersService.userBan(userId, banDto);
    if (!isBanned) throw new NotFoundException();
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
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
