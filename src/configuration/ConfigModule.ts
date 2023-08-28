import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './configuration';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env.local', '.env'],
  load: [getConfiguration],
  cache: true,
});
