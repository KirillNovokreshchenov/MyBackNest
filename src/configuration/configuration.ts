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
});
export type ConfigType = ReturnType<typeof getConfiguration>;
