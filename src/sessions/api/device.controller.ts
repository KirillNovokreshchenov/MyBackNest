import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RefreshJwtAuthGuard } from '../../auth/guards/refresh-auth.guard';
import {
  CurrentUserRefresh,
  ParseCurrentRefreshPipe,
} from '../../auth/decorators/create-param-user-refresh.decorator';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { DeviceQueryRepository } from '../infrastructure/device.query.repository';
import { DeviceViewModel } from './view-model/DeviceViewModel';
import { ParseObjectIdPipe } from '../../pipes-global/parse-object-id-pipe.service';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllSessionsCommand } from '../application/use-cases/delete-all-sessions-use-case';
import { DeleteSessionCommand } from '../application/use-cases/delete -session-use-case';
import { switchError } from '../../helpers/switch-error';
import { IdType } from '../../models/IdType';
import { isError } from '../../models/RESPONSE_ERROR';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';

@Controller('security/devices')
export class DeviceController {
  constructor(
    protected deviceQueryRepo: DeviceQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(RefreshJwtAuthGuard)
  @Get()
  async findAllSession(
    @CurrentUserRefresh(ParseCurrentRefreshPipe)
    userFromRefresh: UserFromRefreshType,
  ): Promise<DeviceViewModel[]> {
    return this.deviceQueryRepo.findAllSession(userFromRefresh);
  }
  @UseGuards(RefreshJwtAuthGuard)
  @Delete()
  async deleteAllSessions(
    @CurrentUserRefresh(ParseCurrentRefreshPipe)
    userFromRefresh: UserFromRefreshType,
  ) {
    const isDeleted = await this.commandBus.execute(
      new DeleteAllSessionsCommand(userFromRefresh),
    );
    if (isError(isDeleted)) return switchError(isDeleted);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
  @UseGuards(RefreshJwtAuthGuard)
  @Delete('/:id')
  async deleteSession(
    @Param('id', ParseObjectIdPipe) deviceId: IdType,
    @CurrentUserRefresh(ParseCurrentRefreshPipe)
    userFromRefresh: UserFromRefreshType,
  ) {
    const isDeleted = await this.commandBus.execute(
      new DeleteSessionCommand(deviceId, userFromRefresh),
    );
    if (isError(isDeleted)) return switchError(isDeleted);
    throw new HttpException(RESPONSE_SUCCESS.NO_CONTENT, HttpStatus.NO_CONTENT);
  }
}
