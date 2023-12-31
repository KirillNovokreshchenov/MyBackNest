import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../../users/application/dto/CreateUserDto';
import { UsersService } from '../../users/application/users.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RegistrationPipe } from '../pipes/registration.pipe';
import { CodeDto } from '../../users/application/dto/CodeDto';
import { EmailDto } from '../../users/application/dto/EmailDto';
import { NewPasswordDto } from '../application/dto/NewPasswordDto';
import { LoginDto } from '../application/dto/loginDto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CurrentUser } from '../decorators/create-param-current-user.decorator';
import { SessionDataType } from './input-model/user-data-request.type';
import { AuthService } from '../application/auth.service';
import { Response } from 'express';
import { RefreshJwtAuthGuard } from '../guards/refresh-auth.guard';
import {
  CurrentUserRefresh,
  ParseCurrentRefreshPipe,
} from '../decorators/create-param-user-refresh.decorator';
import { UserFromRefreshType } from './input-model/user-from-refresh.type';
import { TokenViewModel } from './view-model/TokenViewModel';
import {
  CurrentUserId,
  ParseCurrentIdDecorator,
} from '../decorators/create-param-current-id.decarator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateTokensCommand } from '../application/use-cases/create-tokens-use-case';
import { NewTokensCommand } from '../application/use-cases/new-tokens-use-case';
import { LogoutCommand } from '../application/use-cases/logout-use-case';
import { CreateUserByRegistrationCommand } from '../../users/application/use-cases/create-user-by-registration-use-case';
import { ConfirmByEmailCommand } from '../../users/application/use-cases/confirm-by-email-use-case';
import { EmailResendingCommand } from '../../users/application/use-cases/email -resending-use-case';
import { RecoveryPasswordCommand } from '../../users/application/use-cases/recovery -password-use-case';
import { NewPasswordCommand } from '../../users/application/use-cases/new-password-use-case';
import { IdType } from '../../models/IdType';
import { isError } from '../../models/RESPONSE_ERROR';
import { switchError } from '../../helpers/switch-error';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';

@Controller('auth')
export class AuthController {
  constructor(
    protected usersService: UsersService,
    protected authService: AuthService,
    protected usersQueryRepo: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@CurrentUserId(ParseCurrentIdDecorator) id: IdType) {
    const user = this.usersQueryRepo.findUserAuth(id);
    if (isError(user)) return switchError(user);
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @CurrentUser() userData: SessionDataType,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenViewModel> {
    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(userData),
    );
    if (isError(tokens)) return switchError(tokens);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return tokens.accessToken;
  }
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(200)
  @Post('/refresh-token')
  async newTokens(
    @CurrentUserRefresh(ParseCurrentRefreshPipe)
    userFromRefresh: UserFromRefreshType,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.commandBus.execute(
      new NewTokensCommand(userFromRefresh),
    );
    if (isError(tokens)) return switchError(tokens);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return tokens.accessToken;
  }
  @UseGuards(RefreshJwtAuthGuard)
  @Post('/logout')
  async logout(
    @CurrentUserRefresh(ParseCurrentRefreshPipe)
    userFromRefresh: UserFromRefreshType,
  ) {
    const logout = await this.commandBus.execute(
      new LogoutCommand(userFromRefresh),
    );
    if (isError(logout)) return switchError(logout);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  async registration(@Body(RegistrationPipe) userDto: CreateUserDto) {
    const userCreate = await this.commandBus.execute(
      new CreateUserByRegistrationCommand(userDto),
    );
    if (isError(userCreate)) return switchError(userCreate);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  async registrationConfirmation(@Body() codeDto: CodeDto) {
    const isConfirmed = await this.commandBus.execute(
      new ConfirmByEmailCommand(codeDto),
    );
    if (isError(isConfirmed))
      return switchError(isConfirmed, [
        { message: 'incorrect code', field: 'code' },
      ]);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  async emailResending(@Body() emailDto: EmailDto) {
    const emailResending = await this.commandBus.execute(
      new EmailResendingCommand(emailDto),
    );
    if (isError(emailResending))
      return switchError(emailResending, [
        { message: 'incorrect email', field: 'email' },
      ]);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/password-recovery')
  async passwordRecovery(@Body() emailDto: EmailDto) {
    await this.commandBus.execute(new RecoveryPasswordCommand(emailDto));
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/new-password')
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    const newPassword = await this.commandBus.execute(
      new NewPasswordCommand(newPasswordDto),
    );
    if (isError(newPassword))
      return switchError(newPassword, [
        { message: 'incorrect recovery code', field: 'recoveryCode' },
      ]);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
}
