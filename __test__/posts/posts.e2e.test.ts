import { Test, TestingModule } from '@nestjs/testing';
import {
  app,
  dbConfigurationTests,
  httpServer,
  testBeforeConfig,
} from '../test-config';
import { AppModule } from '../../src/app.module';
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { blogTestManager } from '../blogs/blog-test-manager';
import { BlogViewModelAll } from '../../src/blogs/api/view-model/BlogViewModelAll';
import { v4 as uuidv4 } from 'uuid';
import { postTestManager } from './post-test-manager';
import { usersTestManager } from '../users/users-test-manager';
import { LIKE_STATUS } from '../../src/models/LikeStatusEnum';

describe('postsTests', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [dbConfigurationTests, AppModule],
    }).compile();
    await testBeforeConfig(moduleFixture);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('create post', () => {
    let blog;
    let post;
    const notExistingBlogId = uuidv4();
    const notExistingPostId = uuidv4();
    it('should return new created blog', async () => {
      const blogData = {
        name: 'ItsTest',
        description: 'ItsTest',
        websiteUrl: 'https://testBlog.com',
      };
      const { blogCreated } = await blogTestManager.createBlogTest(
        blogData,
        HttpStatus.CREATED,
      );
      blog = blogCreated;
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .post('/sa/blogs/' + blog.id + '/posts')
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should not find blog for create post with incorrect blog id', async () => {
      const postData = {
        title: 'testTitle',
        shortDescription: 'testDescription',
        content: 'testContent',
      };
      await request(httpServer)
        .post('/sa/blogs/' + notExistingBlogId + '/posts')
        .auth('admin', 'qwerty')
        .send(postData)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return bad request for incorrect input data', async () => {
      const postData = {
        title: '',
        shortDescription: '',
        content: '',
      };
      const expected = {
        message: expect.any(String),
        field: expect.any(String),
      };
      const { response } = await postTestManager.createPostTest(
        postData,
        blog.id,
        blog.name,
        HttpStatus.BAD_REQUEST,
      );

      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(3);
    });
    it('should return new created post', async () => {
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
      post = postCreated;
    });

    it('should return found post by id', async () => {
      await request(httpServer)
        .get('/posts/' + post.id)
        .expect(HttpStatus.OK, post);
    });
    it('should not return post by not existing id', async () => {
      await request(httpServer)
        .get('/post/' + notExistingPostId)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('update post', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    const notExistingUuid = uuidv4();
    let blog;
    let post;

    it('should return new created blog', async () => {
      const blogData = {
        name: 'ItsTest',
        description: 'ItsTest',
        websiteUrl: 'https://testBlog.com',
      };
      const { blogCreated } = await blogTestManager.createBlogTest(
        blogData,
        HttpStatus.CREATED,
      );
      blog = blogCreated;
    });

    it('should return new created post', async () => {
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
      post = postCreated;
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .put('/sa/blogs/' + blog.id + '/posts/' + post.id)
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return bad request for incorrect input data', async () => {
      const postUpdateIncorrectData = {
        title: '',
        shortDescription: '',
        content: '',
      };
      const expected = {
        message: expect.any(String),
        field: expect.any(String),
      };
      const response = await request(httpServer)
        .put('/sa/blogs/' + blog.id + '/posts/' + post.id)
        .auth('admin', 'qwerty')
        .send(postUpdateIncorrectData)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(3);
    });
    it('should not update post by not existing blog id', async () => {
      const postUpdateData = {
        title: 'testTitleUpdate',
        shortDescription: 'testDescriptionUpdate',
        content: 'testContentUpdate',
      };
      await request(httpServer)
        .put('/sa/blogs/' + notExistingUuid + '/posts/' + post.id)
        .auth('admin', 'qwerty')
        .send(postUpdateData)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should not update post by not existing post id', async () => {
      const postUpdateData = {
        title: 'testTitleUpdate',
        shortDescription: 'testDescriptionUpdate',
        content: 'testContentUpdate',
      };
      await request(httpServer)
        .put('/sa/blogs/' + blog.id + '/posts/' + notExistingUuid)
        .auth('admin', 'qwerty')
        .send(postUpdateData)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return no content status for existing blog id and update post', async () => {
      const postUpdateData = {
        title: 'testTitleUpdate',
        shortDescription: 'testDescriptionUpdate',
        content: 'testContentUpdate',
      };
      await request(httpServer)
        .put('/sa/blogs/' + blog.id + '/posts/' + post.id)
        .auth('admin', 'qwerty')
        .send(postUpdateData)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(httpServer)
        .get('/posts/' + post.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ ...post, ...postUpdateData });
    });
  });
  describe('delete post', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let blog;
    let post;
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
      blog = blogCreated;
    });
    it('should return new created post', async () => {
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
      post = postCreated;
    });
    it('should return found post by id', async () => {
      await request(httpServer)
        .get('/posts/' + post.id)
        .expect(HttpStatus.OK, post);
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .delete('/sa/blogs/' + blog.id + '/posts/' + post.id)
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return not found for not existing post id', async () => {
      await request(httpServer)
        .delete('/sa/blogs/' + blog.id + '/posts/' + notExistingUuid)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return no content for valid id and delete post', async () => {
      await request(httpServer)
        .delete('/sa/blogs/' + blog.id + '/posts/' + post.id)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NO_CONTENT);
    });
    it('should not return deleted post by id', async () => {
      await request(httpServer)
        .get('/posts/' + post.id)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('find all posts with pagination and sorting', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let blogOne;
    let blogTwo;
    let newPostOne;
    let newPostTwo;
    let newPostThree;
    let newPostBlogTwo;
    it('should created two blog', async () => {
      const blogData = {
        name: 'ItsTest',
        description: 'ItsTest',
        websiteUrl: 'https://itstest.com',
      };
      blogOne = (
        await blogTestManager.createBlogTest(blogData, HttpStatus.CREATED)
      ).blogCreated;

      blogTwo = (
        await blogTestManager.createBlogTest(
          { ...blogData, name: 'ItsTestTwo' },
          HttpStatus.CREATED,
        )
      ).blogCreated;
    });

    it('should create 4 posts for two blogs', async () => {
      const postData = {
        title: 'testTitle',
        shortDescription: 'testDescription',
        content: 'testContent',
      };
      newPostOne = (
        await postTestManager.createPostTest(
          { ...postData, title: 'OneTestTitle' },
          blogOne.id,
          blogOne.name,
          HttpStatus.CREATED,
        )
      ).postCreated;
      newPostTwo = (
        await postTestManager.createPostTest(
          { ...postData, shortDescription: 'TwoTestDescription' },
          blogOne.id,
          blogOne.name,
          HttpStatus.CREATED,
        )
      ).postCreated;
      newPostThree = (
        await postTestManager.createPostTest(
          { ...postData, content: 'ThreeTestContent' },
          blogOne.id,
          blogOne.name,
          HttpStatus.CREATED,
        )
      ).postCreated;
      newPostBlogTwo = (
        await postTestManager.createPostTest(
          { ...postData, title: 'testTitleBlogTwo' },
          blogTwo.id,
          blogTwo.name,
          HttpStatus.CREATED,
        )
      ).postCreated;
    });
    it('should return all posts for two blogs', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 4;
      const allPosts = new BlogViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newPostBlogTwo, newPostThree, newPostTwo, newPostOne],
      );
      const response = await request(httpServer)
        .get('/posts')
        .expect(HttpStatus.OK, { ...allPosts });

      expect(response.body.items).toHaveLength(4);
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .get('/sa/blogs/' + blogOne.id + '/posts')
        .auth('xxx', 'xxx')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return all posts with default pagination and sort', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 3;
      const allPosts = new BlogViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newPostThree, newPostTwo, newPostOne],
      );
      const response = await request(httpServer)
        .get('/sa/blogs/' + blogOne.id + '/posts')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK, { ...allPosts });

      expect(response.body.items).toHaveLength(3);
    });
    it('should return all posts sorted by title asc ', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 3;
      const allPosts = new BlogViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newPostOne, newPostTwo, newPostThree],
      );
      await request(httpServer)
        .get('/sa/blogs/' + blogOne.id + '/posts')
        .auth('admin', 'qwerty')
        .query({ sortBy: 'title', sortDirection: 'asc' })
        .expect(HttpStatus.OK, { ...allPosts });
    });
    it('should return second blog with page size equal 1 and page equal 2', async () => {
      const pagesCount = 3;
      const page = 2;
      const pageSize = 1;
      const totalCount = 3;
      const allPosts = new BlogViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [newPostTwo],
      );
      await request(httpServer)
        .get('/sa/blogs/' + blogOne.id + '/posts')
        .auth('admin', 'qwerty')
        .query({ pageNumber: 2, pageSize: 1 })
        .expect(HttpStatus.OK, { ...allPosts });
    });
  });
  describe('test like/dislike', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let blog;
    let post;
    let userOne;
    let userTwo;
    let userOneAccessToken;
    let userTwoAccessToken;
    const incorrectUuid = uuidv4();

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
      blog = blogCreated;
    });
    it('should return new created post', async () => {
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
      post = postCreated;
    });
    it('create and login two user', async () => {
      const userDataOne = {
        login: 'KirOch',
        password: 'Kira1997',
        email: 'Kira@gmail.com',
      };
      const userDataTwo = {
        login: 'Asta',
        password: 'Asta1997',
        email: 'Asta@gmail.com',
      };
      userOne = (
        await usersTestManager.createUserTest(userDataOne, HttpStatus.CREATED)
      ).userCreated;
      userTwo = (
        await usersTestManager.createUserTest(userDataTwo, HttpStatus.CREATED)
      ).userCreated;
      const resOne = await request(httpServer).post('/auth/login').send({
        loginOrEmail: userDataOne.login,
        password: userDataOne.password,
      });
      userOneAccessToken = resOne.body.accessToken;
      const resTwo = await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: userDataTwo.login,
          password: userDataTwo.password,
        })
        .expect(HttpStatus.OK);
      userTwoAccessToken = resTwo.body.accessToken;
    });
    it('should not return not existing post with update status like', async () => {
      await request(httpServer)
        .put('/posts/' + incorrectUuid + '/like-status')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.LIKE,
        })
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should not return post with incorrect status like ', async () => {
      await request(httpServer)
        .put('/posts/' + post.id + '/like-status')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          likeStatus: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should return post with update status to like by user one', async () => {
      await request(httpServer)
        .put('/posts/' + post.id + '/like-status')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.LIKE,
        })
        .expect(HttpStatus.NO_CONTENT);
      const newestLikeUserOne = {
        addedAt: expect.any(String),
        userId: userOne.id,
        login: userOne.login,
      };
      const res = await request(httpServer)
        .get('/posts/' + post.id)
        .expect(HttpStatus.OK);
      expect(res.body.extendedLikesInfo.myStatus).toBe(LIKE_STATUS.NONE);
      expect(res.body.extendedLikesInfo.likesCount).toBe(1);
      expect(res.body.extendedLikesInfo.newestLikes).toHaveLength(1);
      expect(res.body.extendedLikesInfo.newestLikes).toContainEqual(
        newestLikeUserOne,
      );
      const resWithSet = await request(httpServer)
        .get('/posts/' + post.id)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(HttpStatus.OK);
      expect(resWithSet.body.extendedLikesInfo.myStatus).toBe(LIKE_STATUS.LIKE);
      expect(resWithSet.body.extendedLikesInfo.likesCount).toBe(1);
      expect(resWithSet.body.extendedLikesInfo.newestLikes).toHaveLength(1);
      expect(resWithSet.body.extendedLikesInfo.newestLikes).toContainEqual(
        newestLikeUserOne,
      );
    });
    it('should return post with update status to like by user two', async () => {
      await request(httpServer)
        .put('/posts/' + post.id + '/like-status')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.LIKE,
        })
        .expect(HttpStatus.NO_CONTENT);
      const newestLikeUserTwo = {
        addedAt: expect.any(String),
        userId: userTwo.id,
        login: userTwo.login,
      };
      const resWithSet = await request(httpServer)
        .get('/posts/' + post.id)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .expect(HttpStatus.OK);
      expect(resWithSet.body.extendedLikesInfo.myStatus).toBe(LIKE_STATUS.LIKE);
      expect(resWithSet.body.extendedLikesInfo.likesCount).toBe(2);
      expect(resWithSet.body.extendedLikesInfo.newestLikes).toHaveLength(2);
      expect(resWithSet.body.extendedLikesInfo.newestLikes).toContainEqual(
        newestLikeUserTwo,
      );
    });
    it('should return post with update status to dislike by user two', async () => {
      await request(httpServer)
        .put('/posts/' + post.id + '/like-status')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.DISLIKE,
        })
        .expect(HttpStatus.NO_CONTENT);
      const newestLikeUserTwo = {
        addedAt: expect.any(String),
        userId: userTwo.id,
        login: userTwo.login,
      };
      const resWithSet = await request(httpServer)
        .get('/posts/' + post.id)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .expect(HttpStatus.OK);
      expect(resWithSet.body.extendedLikesInfo.myStatus).toBe(
        LIKE_STATUS.DISLIKE,
      );
      expect(resWithSet.body.extendedLikesInfo.likesCount).toBe(1);
      expect(resWithSet.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(resWithSet.body.extendedLikesInfo.newestLikes).toHaveLength(1);
      expect(resWithSet.body.extendedLikesInfo.newestLikes).not.toContainEqual(
        newestLikeUserTwo,
      );
    });
    it('should return post with update status to none by user one', async () => {
      await request(httpServer)
        .put('/posts/' + post.id + '/like-status')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.NONE,
        })
        .expect(HttpStatus.NO_CONTENT);
      const newestLikeUserOne = {
        addedAt: expect.any(String),
        userId: userOne.id,
        login: userOne.login,
      };
      const resWithSet = await request(httpServer)
        .get('/posts/' + post.id)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(HttpStatus.OK);
      expect(resWithSet.body.extendedLikesInfo.myStatus).toBe(LIKE_STATUS.NONE);
      expect(resWithSet.body.extendedLikesInfo.likesCount).toBe(0);
      expect(resWithSet.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(resWithSet.body.extendedLikesInfo.newestLikes).toHaveLength(0);
      expect(resWithSet.body.extendedLikesInfo.newestLikes).not.toContainEqual(
        newestLikeUserOne,
      );
    });
  });
});
