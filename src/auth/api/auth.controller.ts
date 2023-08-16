import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
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
import { UserDataType } from './input-model/user-data-request.type';
import { AuthService } from '../application/auth.service';
import { Response } from 'express';
import { RefreshJwtAuthGuard } from '../guards/refresh-auth.guard';
import { CurrentUserRefresh } from '../decorators/create-param-user-refresh.decorator';
import { UserFromRefreshType } from './input-model/user-from-refresh.type';
import { TokenViewModel } from './view-model/TokenViewModel';
import { CurrentUserId } from '../decorators/create-param-current-id.decarator';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';

@Controller('auth')
export class AuthController {
  constructor(
    protected usersService: UsersService,
    protected authService: AuthService,
    protected usersQueryRepo: UsersQueryRepository,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@CurrentUserId() id: Types.ObjectId) {
    const user = this.usersQueryRepo.findUserAuth(id);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @CurrentUser() userData: UserDataType,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenViewModel> {
    const tokens = await this.authService.createTokens(userData);
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
    @CurrentUserRefresh() userFromRefresh: UserFromRefreshType,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.newTokens(userFromRefresh);
    if (!tokens) throw new UnauthorizedException();
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return tokens.accessToken;
  }
  @UseGuards(RefreshJwtAuthGuard)
  @Post('/logout')
  async logout(@CurrentUserRefresh() userFromRefresh: UserFromRefreshType) {
    const logout = await this.authService.logout(userFromRefresh);
    if (!logout) throw new UnauthorizedException();
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  async registration(@Body(RegistrationPipe) userDto: CreateUserDto) {
    const userCreate = await this.usersService.createUserByRegistration(
      userDto,
    );
    if (userCreate) throw new HttpException('', HttpStatus.NO_CONTENT);
    throw new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  async registrationConfirmation(@Body() codeDto: CodeDto) {
    const isConfirmed = await this.usersService.confirmByEmail(codeDto);
    if (!isConfirmed) {
      throw new BadRequestException([
        { message: 'incorrect code', field: 'code' },
      ]);
    }
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  async emailResending(@Body() emailDto: EmailDto) {
    const emailResending = await this.usersService.emailResending(emailDto);
    if (!emailResending) {
      throw new BadRequestException([
        { message: 'incorrect email', field: 'email' },
      ]);
    }
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/password-recovery')
  async passwordRecovery(@Body() emailDto: EmailDto) {
    await this.usersService.recoveryPassword(emailDto);
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
  @UseGuards(ThrottlerGuard)
  @Post('/new-password')
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    const newPassword = await this.usersService.newPassword(newPasswordDto);
    if (!newPassword) {
      throw new BadRequestException([
        { message: 'incorrect recovery code', field: 'recoveryCode' },
      ]);
    }
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
}
