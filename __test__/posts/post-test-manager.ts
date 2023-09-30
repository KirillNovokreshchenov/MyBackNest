import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { httpServer } from '../test-config';
import { CreatePostForBlogDto } from '../../src/blogs/application/dto/CreatePostForBlogDto';
import { LIKE_STATUS } from '../../src/models/LikeStatusEnum';

export const postTestManager = {
  async createPostTest(
    postData: CreatePostForBlogDto,
    blogId: string,
    blogName: string,
    statusCode: HttpStatus,
  ) {
    const response = await request(httpServer)
      .post('/sa/blogs/' + blogId + '/posts')
      .auth('admin', 'qwerty')
      .send(postData)
      .expect(statusCode);
    let postCreated;
    if (statusCode === HttpStatus.CREATED) {
      postCreated = response.body;
      expect(postCreated).toEqual({
        id: expect.any(String),
        title: postData.title,
        shortDescription: postData.shortDescription,
        content: postData.content,
        blogId: blogId,
        blogName: blogName,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LIKE_STATUS.NONE,
          newestLikes: [],
        },
      });
    }
    return { response, postCreated };
  },
};
