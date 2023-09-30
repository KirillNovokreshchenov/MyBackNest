import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../../src/users/application/dto/CreateUserDto';
import { httpServer } from '../test-config';

export const usersTestManager = {
  async createUserTest(userData: CreateUserDto, statusCode: HttpStatus) {
    const response = await request(httpServer)
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(userData)
      .expect(statusCode);
    let userCreated;
    if (statusCode === HttpStatus.CREATED) {
      userCreated = response.body;
      expect(userCreated).toEqual({
        id: expect.any(String),
        login: userData.login,
        email: userData.email,
        createdAt: expect.any(String),
      });
    }
    return { response, userCreated };
  },
  async createUserByRegTest(userData: CreateUserDto) {
    await request(httpServer)
      .post('/auth/registration')
      .send(userData)
      .expect(HttpStatus.NO_CONTENT);
  },
  async login(userData) {
    const response = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: userData.login,
        password: userData.password,
      })
      .expect(HttpStatus.OK);
    return response;
  },
};
