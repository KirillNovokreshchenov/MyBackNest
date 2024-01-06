import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigType } from './configuration/configuration';
import { ConfigService } from '@nestjs/config';
import { appSettings } from './app.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<ConfigType>);
  const port = configService.get('port');
  appSettings(app);
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
