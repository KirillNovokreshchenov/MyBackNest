import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllSessionsCommand } from '../application/use-cases/delete-all-sessions-use-case';
import { DeleteSessionCommand } from '../application/use-cases/delete -session-use-case';
import { switchError } from '../../helpers/switch-error';
import { IdType } from '../../models/IdType';

@Controller('security/devices')
export class DeviceController {
  constructor(
    protected deviceQueryRepo: DeviceQueryRepository,
    protected deviceService: DeviceService,
    private commandBus: CommandBus,
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
    const isDeleted = await this.commandBus.execute(
      new DeleteAllSessionsCommand(userFromRefresh),
    );
    if (!isDeleted) throw new UnauthorizedException();
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }
  @UseGuards(RefreshJwtAuthGuard)
  @Delete('/:id')
  async deleteSession(
    @Param('id', ParseObjectIdPipe) deviceId: IdType,
    @CurrentUserRefresh() userFromRefresh: UserFromRefreshType,
  ) {
    const isDeleted = await this.commandBus.execute(
      new DeleteSessionCommand(deviceId, userFromRefresh),
    );
    switchError(isDeleted);
  }
}
