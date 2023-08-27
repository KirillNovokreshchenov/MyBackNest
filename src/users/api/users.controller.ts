import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { UserViewModel } from './view-model/UserViewModel';
import { UserViewModelAll } from './view-model/UserViewModelAll';
import { UserQueryInputType } from './input-model/UserQueryInputType';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserByAdminCommand } from '../application/use-cases/create -user-by-admin-use-case';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
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
    const userId = await this.commandBus.execute(
      new CreateUserByAdminCommand(dto),
    );
    const newUser = await this.usersQueryRepository.findUserById(userId);
    if (!newUser) {
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return newUser;
  }
  // @UseGuards(BasicAuthGuard)
  // @Delete('/:id')
  // async deleteUser(
  //   @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  // ): Promise<HttpException> {
  //   const userIsDeleted = await this.usersService.deleteUser(id);
  //   if (userIsDeleted) {
  //     throw new HttpException('No Content', HttpStatus.NO_CONTENT);
  //   } else {
  //     throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
  //   }
  // }
}
