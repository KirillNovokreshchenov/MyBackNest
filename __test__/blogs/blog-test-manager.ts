import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { CreateBlogDto } from '../../src/blogs/application/dto/CreateBlogDto';
import { httpServer } from '../test-config';

export const blogTestManager = {
  async createBlogTest(blogData: CreateBlogDto, statusCode: HttpStatus) {
    const response = await request(httpServer)
      .post('/sa/blogs')
      .auth('admin', 'qwerty')
      .send(blogData)
      .expect(statusCode);
    let blogCreated;
    if (statusCode === HttpStatus.CREATED) {
      blogCreated = response.body;
      expect(blogCreated).toEqual({
        id: expect.any(String),
        name: blogData.name,
        description: blogData.description,
        websiteUrl: blogData.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    }
    return { response, blogCreated };
  },
};
