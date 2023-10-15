import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import process from 'process';

export default new DataSource({
  type: 'postgres',
  host: process.env.HOST_DB,
  port: Number(process.env.PORT_DB),
  username: process.env.USERNAME_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.NAME_TYPEORM_DB,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
  ssl: true,
  entities: ['src/**/*.entity{.ts,.js}'],
});
