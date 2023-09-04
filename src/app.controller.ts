import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import * as process from 'process';
import { ParseObjectIdPipe } from './pipes-global/parse-object-id-pipe.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return {
      hello: this.appService.getHello(),
      bla: process.env.BLABLA2,
    };
  }
}
