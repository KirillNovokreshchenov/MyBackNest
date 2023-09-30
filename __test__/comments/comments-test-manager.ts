import { CreateUserDto } from '../../src/users/application/dto/CreateUserDto';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { httpServer } from '../test-config';
import { CreateCommentDto } from '../../src/comments/application/dto/CreateCommentDto';

export const commentsTestManager = {
  async createCommentTest(
    commentData: CreateCommentDto,
    postId: string,
    accessToken: string,
    user,
    statusCode: HttpStatus,
  ) {
    const response = await request(httpServer)
      .post('/posts/' + postId + '/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(statusCode);
    let commentCreated;
    if (statusCode === HttpStatus.CREATED) {
      commentCreated = response.body;
    }
    return { response, commentCreated };
  },
};
