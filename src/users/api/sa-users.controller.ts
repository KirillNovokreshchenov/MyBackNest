import {
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
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { UsersService } from '../application/users.service';
import { BanDto } from '../application/dto/BanDto';
import { UserQueryInputType } from './input-model/UserQueryInputType';
import { UserViewModelAll } from './view-model/UserViewModelAll';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { UserViewModel } from './view-model/UserViewModel';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserByAdminCommand } from '../application/use-cases/create -user-by-admin-use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user-use-case';
import { UserBanCommand } from '../application/use-cases/user-ban-use-case';
import { IdType } from '../../models/IdType';
import { isError } from '../../models/RESPONSE_ERROR';
import { switchError } from '../../helpers/switch-error';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class SaUsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Get()
  async findAllUsers(
    @Query() dataQuery: UserQueryInputType,
  ): Promise<UserViewModelAll> {
    return await this.usersQueryRepository.findAllUsers(dataQuery);
  }
  @Put(':id/ban')
  async userBan(
    @Param('id', ParseObjectIdPipe) userId: IdType,
    @Body() banDto: BanDto,
  ) {
    const isBanned = await this.commandBus.execute(
      new UserBanCommand(userId, banDto),
    );
    if (!isBanned) throw new NotFoundException();
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserViewModel> {
    const userId = await this.commandBus.execute(
      new CreateUserByAdminCommand(dto),
    );
    const newUser = await this.usersQueryRepository.findUserById(userId);
    if (isError(newUser)) return switchError(newUser);
    return newUser;
  }
  @Delete('/:id')
  async deleteUser(
    @Param('id', ParseObjectIdPipe) userId: IdType,
  ): Promise<HttpException> {
    const isDeleted = await this.commandBus.execute(
      new DeleteUserCommand(userId),
    );
    if (isError(isDeleted)) return switchError(isDeleted);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
}
