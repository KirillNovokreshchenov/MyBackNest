import * as process from 'process';

export const getConfiguration = () => ({
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  basic: {
    login: process.env.ADMIN_LOGIN,
    password: process.env.ADMIN_PASSWORD,
  },
  jwt: {
    secretAT: process.env.SECRET_AT ?? '123',
    secretRT: process.env.SECRET_RT ?? '456',
  },
  ID_TYPE: process.env.ID_TYPE ?? 'STRING',
  SALT_HASH: 10,
  sql: {
    PORT_DB: process.env.PORT_DB,
    HOST_DB: process.env.HOST_DB,
    USERNAME_DB: process.env.USERNAME_DB,
    PASSWORD_DB: process.env.PASSWORD_DB,
    NAME_DB: process.env.NAME_DB,
    DB_URL: process.env.DB_URL,
    NAME_TEST_DB: process.env.NAME_TEST_DB,
  },
  typeORM: {
    PORT_DB: process.env.PORT_DB,
    HOST_DB: process.env.HOST_DB,
    USERNAME_DB: process.env.USERNAME_DB,
    PASSWORD_DB: process.env.PASSWORD_DB,
    NAME_DB: process.env.NAME_TYPEORM_DB,
    DB_URL: process.env.DB_URL,
    NAME_TEST_DB: process.env.NAME_TEST_DB_TYPEORM,
  },
});
export type ConfigType = ReturnType<typeof getConfiguration>;
