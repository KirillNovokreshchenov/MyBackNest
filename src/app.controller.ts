import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as process from 'process';

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
