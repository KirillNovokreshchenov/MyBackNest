import { CreateUserDto } from '../../src/users/application/dto/CreateUserDto';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { httpServer } from '../test-config';
import { CreateCommentDto } from '../../src/comments/application/dto/CreateCommentDto';
import { LIKE_STATUS } from '../../src/models/LikeStatusEnum';
import { blogTestManager } from '../blogs/blog-test-manager';
import { postTestManager } from '../posts/post-test-manager';
import { usersTestManager } from '../users/users-test-manager';

export const commentsTestManager = {
  async createCommentTest(
    commentData: CreateCommentDto,
    postId: string,
    accessToken: string,
    userData,
    statusCode: HttpStatus,
  ) {
    const response = await request(httpServer)
      .post('/posts/' + postId + '/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(commentData)
      .expect(statusCode);
    let commentCreated;
    if (statusCode === HttpStatus.CREATED) {
      commentCreated = response.body;
      expect(commentCreated).toEqual({
        id: expect.any(String),
        content: commentData.content,
        commentatorInfo: {
          userId: userData.id,
          userLogin: userData.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LIKE_STATUS.NONE,
        },
      });
    }
    return { response, commentCreated };
  },
  async preparationTestComment() {
    const blogData = {
      name: 'ItsTest',
      description: 'ItsTest',
      websiteUrl: 'https://testBlog.com',
    };
    const { blogCreated } = await blogTestManager.createBlogTest(
      blogData,
      HttpStatus.CREATED,
    );
    const blog = blogCreated;

    const postData = {
      title: 'testTitle',
      shortDescription: 'testDescription',
      content: 'testContent',
    };
    const { postCreated } = await postTestManager.createPostTest(
      postData,
      blog.id,
      blog.name,
      HttpStatus.CREATED,
    );
    const post = postCreated;
    const userDataOne = {
      login: 'Testlogin',
      password: 'TestPass',
      email: 'TestEmail@gmail.com',
    };
    const userDataTwo = {
      login: 'TestLogin2',
      password: 'TestPassTwo',
      email: 'TestEmailTwo@gmail.com',
    };
    const userOne = (
      await usersTestManager.createUserTest(userDataOne, HttpStatus.CREATED)
    ).userCreated;
    const resLoginOne = await usersTestManager.login(userDataOne);
    const userAccessTokenOne = resLoginOne.body.accessToken;

    const userTwo = (
      await usersTestManager.createUserTest(userDataTwo, HttpStatus.CREATED)
    ).userCreated;
    const resLoginTwo = await usersTestManager.login(userDataTwo);
    const userAccessTokenTwo = resLoginTwo.body.accessToken;
    return { post, userOne, userTwo, userAccessTokenOne, userAccessTokenTwo };
  },
};
