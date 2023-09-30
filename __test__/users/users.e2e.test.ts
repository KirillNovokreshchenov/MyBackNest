import {
  app,
  dbConfiguration,
  httpServer,
  testBeforeConfig,
} from '../test-config';
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { usersTestManager } from './users-test-manager';
import { UserViewModelAll } from '../../src/users/api/view-model/UserViewModelAll';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('usersTests', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [dbConfiguration, AppModule],
      // providers: [AppService],
    }).compile();
    await testBeforeConfig(moduleFixture);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('create user', () => {
    let newUser;
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .post('/sa/users')
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return bad request for incorrect input data', async () => {
      const userData = {
        login: 'x',
        password: 'x',
        email: 'xxx',
      };
      const expected = {
        message: expect.any(String),
        field: expect.any(String),
      };
      const { response } = await usersTestManager.createUserTest(
        userData,
        HttpStatus.BAD_REQUEST,
      );

      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(3);
    });
    it('should return new created user', async () => {
      const userData = {
        login: 'Kira',
        password: 'Kira1999',
        email: 'Kira1999@gmail.com',
      };
      const { userCreated } = await usersTestManager.createUserTest(
        userData,
        HttpStatus.CREATED,
      );
      newUser = userCreated;
    });
    it('should return one user', async () => {
      const response = await request(httpServer)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items).toContainEqual(newUser);
    });
    it('should not create user if login already exist', async () => {
      const userData = {
        login: 'Kira',
        password: 'Kira1999',
        email: 'ValidPass@gmail.com',
      };
      const expected = {
        message: expect.any(String),
        field: 'login',
      };
      const { response } = await usersTestManager.createUserTest(
        userData,
        HttpStatus.BAD_REQUEST,
      );

      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(1);
    });
    it('should not create user if email already exist', async () => {
      const userData = {
        login: 'ValidLogin',
        password: 'Kira1999',
        email: 'Kira1999@gmail.com',
      };
      const expected = {
        message: expect.any(String),
        field: 'email',
      };
      const { response } = await usersTestManager.createUserTest(
        userData,
        HttpStatus.BAD_REQUEST,
      );

      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(1);
    });
  });
  describe('delete user', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let newUser;
    const notExistingUuid = uuidv4();

    it('should return new created user', async () => {
      const userData = {
        login: 'Kira',
        password: 'Kira1999',
        email: 'Kira1999@gmail.com',
      };
      const { userCreated } = await usersTestManager.createUserTest(
        userData,
        HttpStatus.CREATED,
      );
      newUser = userCreated;
    });
    it('should return one user', async () => {
      const response = await request(httpServer)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items).toContainEqual(newUser);
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .delete('/sa/users/' + newUser.id)
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return not found for not existing id', async () => {
      await request(httpServer)
        .delete('/sa/users/' + notExistingUuid)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return no content for not valid id and delete user', async () => {
      await request(httpServer)
        .delete('/sa/users/' + newUser.id)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NO_CONTENT);
    });
    it('should not found deleted user', async () => {
      const response = await request(httpServer)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK);
      expect(response.body.items).toHaveLength(0);
      expect(response.body.items).not.toContainEqual(newUser);
    });
  });
  describe('find all users with pagination and sorting', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let newUserOne;
    let newUserTwo;
    let newUserThree;

    it('should create 3 users', async () => {
      const userDataOne = {
        login: 'Kira',
        password: 'Kira1999',
        email: 'ValidPass@gmail.com',
      };
      const userDataTwo = {
        login: 'Yamada',
        password: 'Yamada123',
        email: 'Yamada@gmail.com',
      };
      const userDataThree = {
        login: 'Gustav',
        password: 'Gustav1999',
        email: 'Gustav1600@gmail.com',
      };
      newUserOne = (
        await usersTestManager.createUserTest(userDataOne, HttpStatus.CREATED)
      ).userCreated;
      newUserTwo = (
        await usersTestManager.createUserTest(userDataTwo, HttpStatus.CREATED)
      ).userCreated;
      newUserThree = (
        await usersTestManager.createUserTest(userDataThree, HttpStatus.CREATED)
      ).userCreated;
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .get('/sa/users')
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return all users with default pagination and sort', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 3;
      const allUsers = new UserViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newUserThree, newUserTwo, newUserOne],
      );
      const response = await request(httpServer)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK, { ...allUsers });

      expect(response.body.items).toHaveLength(3);
    });
    it('should return all users sorted by login asc ', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 3;
      const allUsers = new UserViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newUserThree, newUserOne, newUserTwo],
      );
      await request(httpServer)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .query({ sortBy: 'login', sortDirection: 'asc' })
        .expect(HttpStatus.OK, { ...allUsers });
    });
    it('should return second user with page size equal 1 and page equal 2', async () => {
      const pagesCount = 3;
      const page = 2;
      const pageSize = 1;
      const totalCount = 3;
      const allUsers = new UserViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newUserTwo],
      );
      await request(httpServer)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .query({ pageNumber: 2, pageSize: 1 })
        .expect(HttpStatus.OK, { ...allUsers });
    });
    it('should return user contains login or email term in any position', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 1;
      const allUsers = new UserViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newUserThree],
      );
      await request(httpServer)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .query({ searchLoginTerm: 'gus', searchEmailTerm: 'gus' })
        .expect(HttpStatus.OK, { ...allUsers });
    });
  });
});
