import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { blogTestManager } from './blog-test-manager';
import { v4 as uuidv4 } from 'uuid';
import { BlogViewModelAll } from '../../src/blogs/api/view-model/BlogViewModelAll';
import {
  app,
  dbConfigurationTests,
  httpServer,
  testBeforeConfig,
} from '../test-config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('blogsTests', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [dbConfigurationTests, AppModule],
    }).compile();
    await testBeforeConfig(moduleFixture);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('create blog', () => {
    let newBlog;
    const notExistingUuid = uuidv4();
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .post('/sa/blogs')
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return bad request for incorrect input data', async () => {
      const blogData = {
        name: '',
        description: '',
        websiteUrl: '',
      };
      const expected = {
        message: expect.any(String),
        field: expect.any(String),
      };
      const { response } = await blogTestManager.createBlogTest(
        blogData,
        HttpStatus.BAD_REQUEST,
      );

      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(3);
    });
    it('should return new created blog', async () => {
      const blogData = {
        name: 'ItsTest',
        description: 'ItsTest',
        websiteUrl: 'https://anistars.com',
      };
      const { blogCreated } = await blogTestManager.createBlogTest(
        blogData,
        HttpStatus.CREATED,
      );
      newBlog = blogCreated;
    });
    it('should return found blog by id', async () => {
      await request(httpServer)
        .get('/blogs/' + newBlog.id)
        .expect(HttpStatus.OK, newBlog);
    });
    it('should not return blog by not existing id', async () => {
      await request(httpServer)
        .get('/blogs/' + notExistingUuid)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('update blog', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });

    const updateBlogData = {
      name: 'ItsTestUpdate',
      description: 'ItsTestUpdate',
      websiteUrl: 'https://itstestupdate.com',
    };
    let newBlog;
    const notExistingUuid = uuidv4();

    it('should return new created blog', async () => {
      const blogData = {
        name: 'ItsTest',
        description: 'ItsTest',
        websiteUrl: 'https://itstest.com',
      };
      const { blogCreated } = await blogTestManager.createBlogTest(
        blogData,
        HttpStatus.CREATED,
      );
      newBlog = blogCreated;
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .put('/sa/blogs/' + newBlog.id)
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return bad request for incorrect input data', async () => {
      const blogUpdateDataIncorrect = {
        name: '',
        description: '',
        websiteUrl: '',
      };
      const expected = {
        message: expect.any(String),
        field: expect.any(String),
      };
      const response = await request(httpServer)
        .put('/sa/blogs/' + newBlog.id)
        .auth('admin', 'qwerty')
        .send(blogUpdateDataIncorrect)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(3);
    });
    it('should not update blog by not existing id', async () => {
      await request(httpServer)
        .put('/sa/blogs/' + notExistingUuid)
        .auth('admin', 'qwerty')
        .send(updateBlogData)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return no content status for existing id and update blog', async () => {
      await request(httpServer)
        .put('/sa/blogs/' + newBlog.id)
        .auth('admin', 'qwerty')
        .send(updateBlogData)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(httpServer)
        .get('/blogs/' + newBlog.id)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ ...newBlog, ...updateBlogData });
    });
  });
  describe('delete blog', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let newBlog;
    const notExistingUuid = uuidv4();

    it('should return new created blog', async () => {
      const blogData = {
        name: 'ItsTest',
        description: 'ItsTest',
        websiteUrl: 'https://itstest.com',
      };
      const { blogCreated } = await blogTestManager.createBlogTest(
        blogData,
        HttpStatus.CREATED,
      );
      newBlog = blogCreated;
    });
    it('should return found blog by id', async () => {
      await request(httpServer)
        .get('/blogs/' + newBlog.id)
        .expect(HttpStatus.OK, newBlog);
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .delete('/sa/blogs/' + newBlog.id)
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return not found for not existing id', async () => {
      await request(httpServer)
        .delete('/sa/blogs/' + notExistingUuid)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return no content for not valid id and delete blog', async () => {
      await request(httpServer)
        .delete('/sa/blogs/' + newBlog.id)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NO_CONTENT);
    });
    it('should not return deleted blog by id', async () => {
      await request(httpServer)
        .get('/blogs/' + newBlog.id)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('find all blogs with pagination and sorting', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let newBlogOne;
    let newBlogTwo;
    let newBlogThree;

    it('should create 3 blogs', async () => {
      const blogData = {
        name: 'ItsTest',
        description: 'ItsTest',
        websiteUrl: 'https://anistars.com',
      };
      newBlogOne = (
        await blogTestManager.createBlogTest(blogData, HttpStatus.CREATED)
      ).blogCreated;
      newBlogTwo = (
        await blogTestManager.createBlogTest(
          { ...blogData, name: 'ItsTestTwo' },
          HttpStatus.CREATED,
        )
      ).blogCreated;
      newBlogThree = (
        await blogTestManager.createBlogTest(
          { ...blogData, description: 'ItsTestThree' },
          HttpStatus.CREATED,
        )
      ).blogCreated;
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .get('/sa/blogs')
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return all blogs with default pagination and sort', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 3;
      const allBlogs = new BlogViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newBlogThree, newBlogTwo, newBlogOne],
      );
      const response = await request(httpServer)
        .get('/sa/blogs')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK, { ...allBlogs });

      expect(response.body.items).toHaveLength(3);
    });
    it('should return all blogs sorted by name asc ', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 3;
      const allBlogs = new BlogViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newBlogOne, newBlogThree, newBlogTwo],
      );
      await request(httpServer)
        .get('/sa/blogs')
        .auth('admin', 'qwerty')
        .query({ sortBy: 'name', sortDirection: 'asc' })
        .expect(HttpStatus.OK, { ...allBlogs });
    });
    it('should return second blog with page size equal 1 and page equal 2', async () => {
      const pagesCount = 3;
      const page = 2;
      const pageSize = 1;
      const totalCount = 3;
      const allBlogs = new BlogViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newBlogTwo],
      );
      const response = await request(httpServer)
        .get('/sa/blogs')
        .auth('admin', 'qwerty')
        .query({ pageNumber: 2, pageSize: 1 })
        .expect(HttpStatus.OK, { ...allBlogs });
    });
    it('should return blog contains term in any position', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 1;
      const allBlogs = new BlogViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newBlogTwo],
      );
      await request(httpServer)
        .get('/sa/blogs')
        .auth('admin', 'qwerty')
        .query({ searchNameTerm: 'Two' })
        .expect(HttpStatus.OK, { ...allBlogs });
    });
  });
});
