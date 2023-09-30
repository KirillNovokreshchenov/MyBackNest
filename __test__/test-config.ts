import { TypeOrmModule } from '@nestjs/typeorm';
import { configModule } from '../src/configuration/ConfigModule';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../src/configuration/configuration';
import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { appSettings } from '../src/app.settings';
import request from 'supertest';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbConfiguration = TypeOrmModule.forRootAsync({
  imports: [configModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService<ConfigType>) => ({
    type: 'postgres',
    host: configService.get('sql.HOST_DB', { infer: true }),
    port: configService.get('sql.PORT_DB', { infer: true }),
    username: configService.get('sql.USERNAME_DB', { infer: true }),
    password: configService.get('sql.PASSWORD_DB', { infer: true }),
    database: configService.get('sql.NAME_TEST_DB', { infer: true }),
    autoLoadEntities: false,
    synchronize: false,
    ssl: true,
  }),
});
export let httpServer;
export let app: INestApplication;
export const testBeforeConfig = async (moduleFixture: TestingModule) => {
  app = moduleFixture.createNestApplication();
  appSettings(app);
  await app.init();
  httpServer = app.getHttpServer();
  await request(httpServer).delete('/testing/all-data');
};
