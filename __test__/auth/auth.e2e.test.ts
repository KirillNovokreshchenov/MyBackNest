import {
  app,
  dbConfigurationTests,
  httpServer,
  testBeforeConfig,
} from '../test-config';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { BcryptAdapter } from '../../src/users/infrastructure/adapters/bcryptAdapter';
import { EmailManagers } from '../../src/auth/application/managers/email.managers';
import { v4 as uuidv4 } from 'uuid';
import { EmailAdapter } from '../../src/auth/infrastructure/adapters/email.adapter';
import { usersTestManager } from '../users/users-test-manager';
import { DataSource } from 'typeorm';

describe('authTests', () => {
  let bcryptAdapter: BcryptAdapter;
  let emailManger: EmailManagers;
  let dataSource: DataSource;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [dbConfigurationTests, AppModule],
      providers: [BcryptAdapter, EmailManagers, EmailAdapter],
    }).compile();
    await testBeforeConfig(moduleFixture);
    bcryptAdapter = moduleFixture.get<BcryptAdapter>(BcryptAdapter);
    emailManger = moduleFixture.get<EmailManagers>(EmailManagers);
    dataSource = new DataSource({
      type: 'postgres',
      host: 'ep-steep-snowflake-84669586-pooler.us-east-1.postgres.vercel-storage.com',
      port: 5432,
      username: 'default',
      password: 'dHrPMyXhz1D7',
      database: 'testdb',
      synchronize: false,
      ssl: true,
    });
    await dataSource.initialize();
    // console.log(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  const correctPass = 'Asta1999';
  const login = 'Asta';
  const email = 'kirillnovokrest@gmail.com';

  describe('create user by registration', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should create user by registration', async () => {
      const spyEmailManager = jest
        .spyOn(emailManger, 'emailRegistration')
        .mockImplementation(() => Promise.resolve());
      const userData = {
        login: login,
        password: correctPass,
        email: email,
      };
      await usersTestManager.createUserByRegTest(userData);
      expect(spyEmailManager).toHaveBeenCalledTimes(1);

      const user = await dataSource.query(`SELECT login, email FROM users `);
      expect(user[0]).toBeTruthy();
      expect(user[0].login).toBe(login);
      expect(user[0].email).toBe(email);
    });
    it('should not create user by registration with incorrect data', async () => {
      const badUserData = {
        login: '',
        password: '',
        email: '',
      };
      const expected = {
        message: expect.any(String),
        field: expect.any(String),
      };
      const res = await request(httpServer)
        .post('/auth/registration')
        .send(badUserData)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.errorsMessages).toContainEqual(expected);
      expect(res.body.errorsMessages).toHaveLength(3);
    });
    it('should not create user if login already exist', async () => {
      const badUserData = {
        login: 'Asta',
        password: 'Kira1999',
        email: 'ValidPass@gmail.com',
      };
      const expected = {
        message: expect.any(String),
        field: 'login',
      };
      const res = await request(httpServer)
        .post('/auth/registration')
        .send(badUserData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.errorsMessages).toContainEqual(expected);
      expect(res.body.errorsMessages).toHaveLength(1);
    });
    it('should not create user if email already exist', async () => {
      const badUserData = {
        login: 'ValidLogin',
        password: 'Kira1999',
        email: 'kirillnovokrest@gmail.com',
      };
      const expected = {
        message: expect.any(String),
        field: 'email',
      };
      const res = await request(httpServer)
        .post('/auth/registration')
        .send(badUserData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.errorsMessages).toContainEqual(expected);
      expect(res.body.errorsMessages).toHaveLength(1);
    });
  });
  describe('get information about me', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    let accessToken;
    let userData;
    const incorrectToken = uuidv4();
    it('should create user by registration', async () => {
      jest
        .spyOn(emailManger, 'emailRegistration')
        .mockImplementation(() => Promise.resolve());
      userData = {
        login: login,
        password: correctPass,
        email: email,
      };
      await usersTestManager.createUserByRegTest(userData);
    });
    it('should login user ', async () => {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: userData.login,
          password: userData.password,
        })
        .expect(HttpStatus.OK);
      accessToken = res.body.accessToken;
    });
    it('should return created user', async () => {
      const expected = {
        email: email,
        login: login,
        userId: expect.any(String),
      };

      const res = await request(httpServer)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual(expected);
    });
    it('should return unauthorized status for incorrect token', async () => {
      await request(httpServer)
        .get('/auth/me')
        .set('Authorization', `Bearer ${incorrectToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
  describe('email confirmation', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    const correctCode = uuidv4();
    const incorrectCode = uuidv4();
    it('should create user by registration', async () => {
      const spyBcryptAdapter = jest
        .spyOn(bcryptAdapter, 'uuid')
        .mockImplementation(() => correctCode);
      const spyEmailManager = jest
        .spyOn(emailManger, 'emailRegistration')
        .mockImplementation(() => Promise.resolve());
      const userData = {
        login: login,
        password: correctPass,
        email: email,
      };
      await usersTestManager.createUserByRegTest(userData);
      expect(spyBcryptAdapter).toHaveBeenCalledTimes(1);
      expect(spyEmailManager).toHaveBeenCalledTimes(1);

      const emailConfirmation = await dataSource.query(
        `SELECT * FROM email_confirmation WHERE confirmation_code =$1`,
        [correctCode],
      );
      expect(correctCode).toBe(emailConfirmation[0].confirmation_code);
      expect(emailConfirmation.is_confirmed).toBeFalsy();
    });
    it('should not confirm registration by incorrect code', async () => {
      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({ code: incorrectCode })
        .expect(HttpStatus.BAD_REQUEST);
      const emailConfirmation = await dataSource.query(
        `SELECT * FROM email_confirmation WHERE confirmation_code =$1`,
        [correctCode],
      );
      expect(emailConfirmation[0].is_confirmed).toBeFalsy();
    });
    it('should confirm registration by correct code', async () => {
      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({ code: correctCode })
        .expect(HttpStatus.NO_CONTENT);
      const emailConfirmation = await dataSource.query(
        `SELECT * FROM email_confirmation WHERE confirmation_code =$1`,
        [correctCode],
      );
      expect(emailConfirmation[0].is_confirmed).toBeTruthy();
    });
  });
  describe('email resending', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    const correctCodeOne = uuidv4();
    const correctCodeTwo = uuidv4();
    const incorrectCode = uuidv4();
    it('should create user by registration', async () => {
      const spyBcryptAdapter = jest
        .spyOn(bcryptAdapter, 'uuid')
        .mockImplementation(() => correctCodeOne);
      jest
        .spyOn(emailManger, 'emailRegistration')
        .mockImplementation(() => Promise.resolve());
      const userData = {
        login: login,
        password: correctPass,
        email: email,
      };
      await usersTestManager.createUserByRegTest(userData);
      expect(spyBcryptAdapter).toHaveBeenCalledTimes(1);

      const emailConfirmation = await dataSource.query(
        `SELECT * FROM email_confirmation WHERE confirmation_code =$1`,
        [correctCodeOne],
      );
      expect(correctCodeOne).toBe(emailConfirmation[0].confirmation_code);
      expect(emailConfirmation.is_confirmed).toBeFalsy();
    });
    it('should return bad request by incorrect email', async () => {
      await request(httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: '' })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should resend confirmation registration email with new code', async () => {
      const spyBcryptAdapter = jest
        .spyOn(bcryptAdapter, 'uuid')
        .mockImplementation(() => correctCodeTwo);
      const spyEmailManager = jest
        .spyOn(emailManger, 'emailRegistration')
        .mockImplementation(() => Promise.resolve());
      await request(httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: email })
        .expect(HttpStatus.NO_CONTENT);

      expect(spyBcryptAdapter).toHaveBeenCalledTimes(1);
      expect(spyEmailManager).toHaveBeenCalledTimes(1);

      const emailConfirmation = await dataSource.query(
        `SELECT * FROM email_confirmation WHERE confirmation_code =$1`,
        [correctCodeTwo],
      );
      expect(correctCodeTwo).toBe(emailConfirmation[0].confirmation_code);
      expect(emailConfirmation.is_confirmed).toBeFalsy();
    });

    it('should not confirm registration by incorrect code', async () => {
      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({ code: incorrectCode })
        .expect(HttpStatus.BAD_REQUEST);
      const emailConfirmation = await dataSource.query(
        `SELECT * FROM email_confirmation WHERE confirmation_code =$1`,
        [correctCodeTwo],
      );
      expect(emailConfirmation[0].is_confirmed).toBeFalsy();
    });
    it('should confirm registration by correct code', async () => {
      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({ code: correctCodeTwo })
        .expect(HttpStatus.NO_CONTENT);
      const emailConfirmation = await dataSource.query(
        `SELECT * FROM email_confirmation WHERE confirmation_code =$1`,
        [correctCodeTwo],
      );
      expect(emailConfirmation[0].is_confirmed).toBeTruthy();
    });
  });
  describe('new password', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    const correctCode = uuidv4();
    const incorrectCode = uuidv4();
    const newPass = 'newPassword';

    it('should create user by registration', async () => {
      const spyEmailManager = jest
        .spyOn(emailManger, 'emailRegistration')
        .mockImplementation(() => Promise.resolve());
      const userData = {
        login: login,
        password: correctPass,
        email: email,
      };
      await usersTestManager.createUserByRegTest(userData);
    });
    it('should not send email for password recovery', async () => {
      const expected = {
        message: expect.any(String),
        field: 'email',
      };
      const res = await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: '' })
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.errorsMessages).toContainEqual(expected);
      expect(res.body.errorsMessages).toHaveLength(1);
    });
    it('should send email for password recovery', async () => {
      const spyBcryptAdapter = jest
        .spyOn(bcryptAdapter, 'uuid')
        .mockImplementation(() => correctCode);
      const spyEmailManager = jest
        .spyOn(emailManger, 'passwordRecovery')
        .mockImplementation(() => Promise.resolve());
      await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: email })
        .expect(HttpStatus.NO_CONTENT);

      expect(spyBcryptAdapter).toHaveBeenCalledTimes(1);
      expect(spyEmailManager).toHaveBeenCalledTimes(1);

      const recovery = await dataSource.query(
        `SELECT * FROM recovery_password WHERE recovery_code =$1`,
        [correctCode],
      );
      expect(correctCode).toBe(recovery[0].recovery_code);
    });
    it('should not change password by incorrect new password', async () => {
      const newPassData = {
        newPassword: '',
        recoveryCode: incorrectCode,
      };
      const expected = {
        message: expect.any(String),
        field: 'newPassword',
      };

      const res = await request(httpServer)
        .post('/auth/new-password')
        .send(newPassData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.errorsMessages).toContainEqual(expected);
      expect(res.body.errorsMessages).toHaveLength(1);
    });
    it('should not change password by incorrect recovery code', async () => {
      const newPassData = {
        newPassword: newPass,
        recoveryCode: incorrectCode,
      };
      const expected = {
        message: expect.any(String),
        field: 'recoveryCode',
      };
      const res = await request(httpServer)
        .post('/auth/new-password')
        .send(newPassData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.errorsMessages).toContainEqual(expected);
      expect(res.body.errorsMessages).toHaveLength(1);
    });
    it('should change old password to new password', async () => {
      const newPassData = {
        newPassword: newPass,
        recoveryCode: correctCode,
      };
      await request(httpServer)
        .post('/auth/new-password')
        .send(newPassData)
        .expect(HttpStatus.NO_CONTENT);
      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: email,
          password: correctPass,
        })
        .expect(HttpStatus.UNAUTHORIZED);
      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: email,
          password: newPass,
        })
        .expect(HttpStatus.OK);
    });
  });
});
