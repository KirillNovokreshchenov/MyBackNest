import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { RefreshJwtAuthGuard } from '../../auth/guards/refresh-auth.guard';
import { CurrentUserRefresh } from '../../auth/decorators/create-param-user-refresh.decorator';
import { UserFromRefreshType } from '../../auth/api/input-model/user-from-refresh.type';
import { DeviceQueryRepository } from '../infrastructure/device.query.repository';
import { DeviceViewModel } from './view-model/DeviceViewModel';
import { DeviceService } from '../application/device.service';

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
    const isDeleted = this.deviceService.deleteAllSessions(userFromRefresh);
  }
}
