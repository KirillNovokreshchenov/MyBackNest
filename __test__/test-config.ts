import { TypeOrmModule } from '@nestjs/typeorm';
import { configModule } from '../src/configuration/ConfigModule';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../src/configuration/configuration';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import request from 'supertest';

export const dbConfiguration = TypeOrmModule.forRootAsync({
  imports: [configModule],
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
  inject: [ConfigService],
});
export let httpServer;
export const testConfig = () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [dbConfiguration, AppModule],
      // providers: [AppService],
    }).compile();
    // appController = app.get<AppController>(AppController);
    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
    await request(httpServer).delete('/testing/all-data');
  });
  afterAll(async () => {
    await app.close();
  });
};
