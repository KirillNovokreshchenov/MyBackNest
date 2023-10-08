import { Controller, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { TestingRepository } from './testing.repository';

@Controller('testing')
export class TestingController {
  constructor(protected testingService: TestingRepository) {}
  @Delete('/all-data')
  async deleteAllData() {
    await this.testingService.deleteAllData();
    throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
  }
}
