import { HttpStatus } from '@nestjs/common';
import {
  app,
  dbConfigurationTests,
  httpServer,
  testBeforeConfig,
} from '../test-config';
import request from 'supertest';
import { usersTestManager } from '../users/users-test-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { v4 as uuidv4 } from 'uuid';
describe('devicesTests', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [dbConfigurationTests, AppModule],
    }).compile();
    await testBeforeConfig(moduleFixture);
  });
  afterAll(async () => {
    await app.close();
  });

  let userDataOne;
  let userDataTwo;
  let refreshTokenUserTwo;
  const refreshTokensUserOne: any = {};
  let newRefreshTokenOne;
  let updateSessionOne;
  const notExistingUuid = uuidv4();

  it('should create two user ', async () => {
    userDataOne = {
      login: 'KirOch',
      password: 'Kira1997',
      email: 'Kira@gmail.com',
    };
    userDataTwo = {
      login: 'Asta',
      password: 'Asta1997',
      email: 'Asta@gmail.com',
    };
    await usersTestManager.createUserTest(userDataOne, HttpStatus.CREATED);
    await usersTestManager.createUserTest(userDataTwo, HttpStatus.CREATED);
  });

  it('should login userTwo ', async () => {
    const res = await usersTestManager.login(userDataTwo);
    refreshTokenUserTwo = res.headers['set-cookie'][0].split('=')[1];
  });

  //
  it('should return unauthorized for incorrect password or login', async () => {
    await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: userDataOne.login,
        password: userDataTwo.password,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('four login for user one', async () => {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const userAgent = ['Mozilla', 'Ngrok', 'Opera', 'Chrome'];
    for (let i = 0; i < userAgent.length; i++) {
      const res = await request(httpServer)
        .post('/auth/login')
        .set('user-agent', `${userAgent[i]}`)
        .send({
          loginOrEmail: userDataOne.login,
          password: userDataOne.password,
        })
        .expect(HttpStatus.OK);
      refreshTokensUserOne[`token${i + 1}`] =
        res.headers['set-cookie'][0].split('=')[1];

      expect(res.body).toEqual({
        accessToken: expect.stringMatching(
          /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/,
        ),
      });
    }
    expect(Object.keys(refreshTokensUserOne)).toHaveLength(4);
  }, 15000);

  let sessionOne;
  let sessionTwo;
  let sessionThree;
  let sessionFour;

  it('should return 401 status - unauthorized for get all sessions', async () => {
    await request(httpServer)
      .get('/security/devices')
      .set('Cookie', 'refreshToken=1')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('get all session by refresh token for user one', async () => {
    const res = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', 'refreshToken= ' + refreshTokensUserOne.token1)
      .expect(HttpStatus.OK);
    sessionOne = res.body[0];
    sessionTwo = res.body[1];
    sessionThree = res.body[2];
    sessionFour = res.body[3];
    expect(res.body).toHaveLength(4);
    expect(res.body[0].title).toBe('Mozilla');
    expect(res.body[1].title).toBe('Ngrok');
    expect(res.body[2].title).toBe('Opera');
    expect(res.body[3].title).toBe('Chrome');
  });

  it('update refresh token one', async () => {
    const res = await request(httpServer)
      .post('/auth/refresh-token')
      .set('Cookie', 'refreshToken= ' + refreshTokensUserOne.token1)
      .expect(HttpStatus.OK);
    newRefreshTokenOne = res.headers['set-cookie'][0].split('=')[1];
    expect(newRefreshTokenOne).not.toBe(refreshTokensUserOne.token1);
    expect(res.body).toEqual({
      accessToken: expect.stringMatching(
        /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/,
      ),
    });
  });

  it('get all session by new refresh token one', async () => {
    const res = await request(httpServer)
      .get('/security/devices')
      .set('Cookie', 'refreshToken= ' + newRefreshTokenOne)
      .expect(HttpStatus.OK);
    expect(res.body).toHaveLength(4);

    expect(res.body[0]).toEqual(sessionTwo);
    expect(res.body[1]).toEqual(sessionThree);
    expect(res.body[2]).toEqual(sessionFour);
    expect(res.body[3]).not.toEqual(sessionOne);

    updateSessionOne = res.body[3];

    expect(res.body[0].deviceId).toBe(sessionTwo.deviceId);
    expect(res.body[1].deviceId).toBe(sessionThree.deviceId);
    expect(res.body[2].deviceId).toBe(sessionFour.deviceId);
    expect(res.body[3].deviceId).toBe(sessionOne.deviceId);

    expect(res.body[3].lastActiveDate).not.toBe(sessionOne.lastActiveDate);

    expect(res.body[0].lastActiveDate).toBe(sessionTwo.lastActiveDate);
    expect(res.body[1].lastActiveDate).toBe(sessionThree.lastActiveDate);
    expect(res.body[2].lastActiveDate).toBe(sessionFour.lastActiveDate);
  });

  it('delete session two by refresh token other user, should return 403', async () => {
    await request(httpServer)
      .delete('/security/devices/' + sessionTwo.deviceId)
      .set('Cookie', 'refreshToken= ' + refreshTokenUserTwo)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('delete session two by new refresh token user one for not existing device', async () => {
    await request(httpServer)
      .delete('/security/devices/' + notExistingUuid)
      .set('Cookie', 'refreshToken= ' + newRefreshTokenOne)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('delete session two by new refresh token one', async () => {
    await request(httpServer)
      .delete('/security/devices/' + sessionTwo.deviceId)
      .set('Cookie', 'refreshToken= ' + newRefreshTokenOne)
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get('/security/devices')
      .set('Cookie', 'refreshToken= ' + newRefreshTokenOne)
      .expect(HttpStatus.OK, [sessionThree, sessionFour, updateSessionOne]);
  });

  it('logout session three by new refresh token one', async () => {
    await request(httpServer)
      .post('/auth/logout')
      .set('Cookie', 'refreshToken= ' + refreshTokensUserOne.token3)
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get('/security/devices')
      .set('Cookie', 'refreshToken= ' + newRefreshTokenOne)
      .expect(HttpStatus.OK, [sessionFour, updateSessionOne]);
  });

  it('delete all session except current by new refresh token one', async () => {
    await request(httpServer)
      .delete('/security/devices')
      .set('Cookie', 'refreshToken= ' + newRefreshTokenOne)
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .get('/security/devices')
      .set('Cookie', 'refreshToken= ' + newRefreshTokenOne)
      .expect(HttpStatus.OK, [updateSessionOne]);
  });
});
