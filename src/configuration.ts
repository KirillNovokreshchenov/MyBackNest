export default () => ({
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  basic: {
    login: process.env.ADMIN_LOGIN,
    password: process.env.ADMIN_PASSWORD,
  },
  secretAT: process.env.SECRET_AT,
  secretRT: process.env.SECRET_RT,
});
