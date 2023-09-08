import { Controller, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { TestingService } from './testing.service';

@Controller('testing')
export class TestingController {
  constructor(protected testingService: TestingService) {}
  @Delete('/all-data')
  async deleteAllData() {
    await this.testingService.deleteAllData();
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
}
