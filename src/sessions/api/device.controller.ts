import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RefreshJwtAuthGuard } from '../../auth/guards/refresh-auth.guard';
import { CurrentUserRefresh } from '../../auth/decorators/create-param-user-refresh.decorator';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { DeviceQueryRepository } from '../infrastructure/device.query.repository';
import { DeviceViewModel } from './view-model/DeviceViewModel';
import { DeviceService } from '../application/device.service';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { Types } from 'mongoose';
import { RESPONSE_OPTIONS } from '../../models/ResponseOptionsEnum';

@Controller('security/devices')
export class DeviceController {
  constructor(
    protected deviceQueryRepo: DeviceQueryRepository,
    protected deviceService: DeviceService,
  ) {}
  @UseGuards(RefreshJwtAuthGuard)
  @Get()
  async findAllSession(
    @CurrentUserRefresh() userFromRefresh: UserFromRefreshType,
  ): Promise<DeviceViewModel[]> {
    const devices = await this.deviceQueryRepo.findAllSession(userFromRefresh);
    return devices;
  }
  @UseGuards(RefreshJwtAuthGuard)
  @Delete()
  async deleteAllSessions(
    @CurrentUserRefresh() userFromRefresh: UserFromRefreshType,
  ) {
    const isDeleted = await this.deviceService.deleteAllSessions(
      userFromRefresh,
    );
    if (!isDeleted) throw new UnauthorizedException();
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }
  @UseGuards(RefreshJwtAuthGuard)
  @Delete('/:id')
  async deleteSession(
    @Param('id', ParseObjectIdPipe) deviceId: Types.ObjectId,
    @CurrentUserRefresh() userFromRefresh: UserFromRefreshType,
  ) {
    const isDeleted = await this.deviceService.deleteSession(
      deviceId,
      userFromRefresh,
    );
    switch (isDeleted) {
      case RESPONSE_OPTIONS.NOT_FOUND:
        throw new NotFoundException();
      case RESPONSE_OPTIONS.FORBIDDEN:
        throw new ForbiddenException();
      case RESPONSE_OPTIONS.NO_CONTENT:
        throw new HttpException('No content', HttpStatus.NO_CONTENT);
    }
  }
}
