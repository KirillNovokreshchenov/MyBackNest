import { Test, TestingModule } from '@nestjs/testing';
import {
  app,
  dbConfiguration,
  httpServer,
  testBeforeConfig,
} from '../test-config';
import { AppModule } from '../../src/app.module';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { commentsTestManager } from './comments-test-manager';
import { CommentViewModelAll } from '../../src/comments/api/view-models/CommentViewModelAll';
import { LIKE_STATUS } from '../../src/models/LikeStatusEnum';

describe('commentsTests', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [dbConfiguration, AppModule],
    }).compile();
    await testBeforeConfig(moduleFixture);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('create comment', () => {
    let post;
    let comment;
    let user;
    let userAccessToken;
    const notExistingId = uuidv4();
    it('preparation data for test comment', async () => {
      const preparationData =
        await commentsTestManager.preparationTestComment();
      post = preparationData.post;
      user = preparationData.userOne;
      userAccessToken = preparationData.userAccessTokenOne;
    });

    it('should return unauthorised status for incorrect token', async () => {
      const commentData = {
        content: 'TestContent',
      };
      await commentsTestManager.createCommentTest(
        commentData,
        post.id,
        '-1',
        user,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it('should not find post for create comment with incorrect post id', async () => {
      const commentData = {
        content: 'TestContentContentTest',
      };
      await commentsTestManager.createCommentTest(
        commentData,
        notExistingId,
        userAccessToken,
        user,
        HttpStatus.NOT_FOUND,
      );
    });
    it('should return bad request for incorrect input data', async () => {
      const commentData = {
        content: '',
      };
      const expected = {
        message: expect.any(String),
        field: 'content',
      };
      const { response } = await commentsTestManager.createCommentTest(
        commentData,
        post.id,
        userAccessToken,
        user,
        HttpStatus.BAD_REQUEST,
      );

      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(1);
    });
    it('should create comment', async () => {
      const commentData = {
        content: 'TestContentContentTest',
      };
      comment = (
        await commentsTestManager.createCommentTest(
          commentData,
          post.id,
          userAccessToken,
          user,
          HttpStatus.CREATED,
        )
      ).commentCreated;
    });

    it('should return found comment by id', async () => {
      await request(httpServer)
        .get('/comments/' + comment.id)
        .expect(HttpStatus.OK, comment);
    });
    it('should not return comment by not existing id', async () => {
      await request(httpServer)
        .get('/comments/' + notExistingId)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('update comment', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let post;
    let comment;
    let user;
    let userAccessTokenOne;
    let userAccessTokenTwo;
    const notExistingId = uuidv4();
    it('preparation data for test comment', async () => {
      const preparationData =
        await commentsTestManager.preparationTestComment();
      post = preparationData.post;
      user = preparationData.userOne;
      userAccessTokenOne = preparationData.userAccessTokenOne;
      userAccessTokenTwo = preparationData.userAccessTokenTwo;
    });
    it('should create comment', async () => {
      const commentData = {
        content: 'TestContentContentTest',
      };
      comment = (
        await commentsTestManager.createCommentTest(
          commentData,
          post.id,
          userAccessTokenOne,
          user,
          HttpStatus.CREATED,
        )
      ).commentCreated;
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .put('/comments/' + comment.id)
        .set('Authorization', `Bearer ${-1}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return bad request for incorrect input data', async () => {
      const commentUpdateData = {
        content: '',
      };
      const expected = {
        message: expect.any(String),
        field: 'content',
      };
      const response = await request(httpServer)
        .put('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userAccessTokenOne}`)
        .send(commentUpdateData)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.errorsMessages).toContainEqual(expected);
      expect(response.body.errorsMessages).toHaveLength(1);
    });
    it('should not update comment by not existing comment id', async () => {
      const commentUpdateData = {
        content: 'testContentUpdateTest',
      };
      await request(httpServer)
        .put('/comments/' + notExistingId)
        .set('Authorization', `Bearer ${userAccessTokenOne}`)
        .send(commentUpdateData)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return forbidden status when trying update comment by other user', async () => {
      const commentUpdateData = {
        content: 'testContentUpdateTest',
      };
      await request(httpServer)
        .put('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userAccessTokenTwo}`)
        .send(commentUpdateData)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('should return no content status for existing comment id and update comment', async () => {
      const commentUpdateData = {
        content: 'testContentUpdateTest',
      };
      await request(httpServer)
        .put('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userAccessTokenOne}`)
        .send(commentUpdateData)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(httpServer)
        .get('/comments/' + comment.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ ...comment, ...commentUpdateData });
    });
  });
  describe('delete comment', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let post;
    let comment;
    let user;
    let userAccessTokenOne;
    let userAccessTokenTwo;
    const notExistingId = uuidv4();
    it('preparation data for test comment', async () => {
      const preparationData =
        await commentsTestManager.preparationTestComment();
      post = preparationData.post;
      user = preparationData.userOne;
      userAccessTokenOne = preparationData.userAccessTokenOne;
      userAccessTokenTwo = preparationData.userAccessTokenTwo;
    });
    it('should create comment', async () => {
      const commentData = {
        content: 'TestContentContentTest',
      };
      comment = (
        await commentsTestManager.createCommentTest(
          commentData,
          post.id,
          userAccessTokenOne,
          user,
          HttpStatus.CREATED,
        )
      ).commentCreated;
    });
    it('should return found comment by id', async () => {
      await request(httpServer)
        .get('/comments/' + comment.id)
        .expect(HttpStatus.OK, comment);
    });
    it('should return unauthorised status for incorrect password or login', async () => {
      await request(httpServer)
        .delete('/comments/' + comment.id)
        .set('Authorization', `Bearer ${-1}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should return not found for not existing comment id', async () => {
      await request(httpServer)
        .delete('/comments/' + notExistingId)
        .set('Authorization', `Bearer ${userAccessTokenOne}`)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return forbidden status when trying delete comment by other user', async () => {
      await request(httpServer)
        .delete('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userAccessTokenTwo}`)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('should return no content for valid id and delete comment', async () => {
      await request(httpServer)
        .delete('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userAccessTokenOne}`)
        .expect(HttpStatus.NO_CONTENT);
    });
    it('should not return deleted comment by id', async () => {
      await request(httpServer)
        .get('/comments/' + comment.id)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('find all comments with pagination and sorting', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let post;
    let commentOne;
    let commentTwo;
    let commentThree;
    let user;
    let userAccessToken;
    const notExistingId = uuidv4();
    it('preparation data for test comment', async () => {
      const preparationData =
        await commentsTestManager.preparationTestComment();
      post = preparationData.post;
      user = preparationData.userOne;
      userAccessToken = preparationData.userAccessTokenOne;
    });

    it('should create 3 comments for post', async () => {
      commentOne = (
        await commentsTestManager.createCommentTest(
          { content: 'TestContentContentTestOne' },
          post.id,
          userAccessToken,
          user,
          HttpStatus.CREATED,
        )
      ).commentCreated;
      commentTwo = (
        await commentsTestManager.createCommentTest(
          { content: 'TestContentContentTestTwo' },
          post.id,
          userAccessToken,
          user,
          HttpStatus.CREATED,
        )
      ).commentCreated;
      commentThree = (
        await commentsTestManager.createCommentTest(
          { content: 'TestContentContentTestThree' },
          post.id,
          userAccessToken,
          user,
          HttpStatus.CREATED,
        )
      ).commentCreated;
    });
    it('should not return comments for not existing post', async () => {
      await request(httpServer)
        .get('/posts/' + notExistingId + '/comments')
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should return all comments with default pagination and sort', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 3;
      const allComments = new CommentViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [commentThree, commentTwo, commentOne],
      );
      const response = await request(httpServer)
        .get('/posts/' + post.id + '/comments')
        .expect(HttpStatus.OK, { ...allComments });

      expect(response.body.items).toHaveLength(3);
    });

    it('should return all comments sorted by content asc ', async () => {
      const pagesCount = 1;
      const page = 1;
      const pageSize = 10;
      const totalCount = 3;
      const allComments = new CommentViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [commentOne, commentThree, commentTwo],
      );
      await request(httpServer)
        .get('/posts/' + post.id + '/comments')
        .query({ sortBy: 'content', sortDirection: 'asc' })
        .expect(HttpStatus.OK, { ...allComments });
    });
    it('should return second comment with page size equal 1 and page equal 2', async () => {
      const pagesCount = 3;
      const page = 2;
      const pageSize = 1;
      const totalCount = 3;
      const allComments = new CommentViewModelAll(
        pagesCount,
        page,
        pageSize,
        totalCount,
        [commentTwo],
      );
      await request(httpServer)
        .get('/posts/' + post.id + '/comments')
        .query({ pageNumber: 2, pageSize: 1 })
        .expect(HttpStatus.OK, { ...allComments });
    });
  });
  describe('test like/dislike', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data');
    });
    let post;
    let comment;
    let user;
    let userOneAccessToken;
    let userTwoAccessToken;
    const notExistingId = uuidv4();
    it('preparation data for test comment', async () => {
      const preparationData =
        await commentsTestManager.preparationTestComment();
      post = preparationData.post;
      user = preparationData.userOne;
      userOneAccessToken = preparationData.userAccessTokenOne;
      userTwoAccessToken = preparationData.userAccessTokenTwo;
    });
    it('should create comment', async () => {
      const commentData = {
        content: 'TestContentContentTest',
      };
      comment = (
        await commentsTestManager.createCommentTest(
          commentData,
          post.id,
          userOneAccessToken,
          user,
          HttpStatus.CREATED,
        )
      ).commentCreated;
    });
    it('should not return not existing comment with update status like ', async () => {
      await request(httpServer)
        .put('/comments/' + notExistingId + '/like-status')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.LIKE,
        })
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should not return comment with incorrect status like ', async () => {
      await request(httpServer)
        .put('/comments/' + comment.id + '/like-status')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          likeStatus: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should return comment with update status to like by user one', async () => {
      await request(httpServer)
        .put('/comments/' + comment.id + '/like-status')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.LIKE,
        })
        .expect(HttpStatus.NO_CONTENT);
      const res = await request(httpServer)
        .get('/comments/' + comment.id)
        .expect(HttpStatus.OK);
      expect(res.body.likesInfo.myStatus).toBe(LIKE_STATUS.NONE);
      expect(res.body.likesInfo.likesCount).toBe(1);
      const resWithSet = await request(httpServer)
        .get('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(HttpStatus.OK);
      expect(resWithSet.body.likesInfo.myStatus).toBe(LIKE_STATUS.LIKE);
      expect(resWithSet.body.likesInfo.likesCount).toBe(1);
    });
    it('should return comment with update status to like by user two', async () => {
      await request(httpServer)
        .put('/comments/' + comment.id + '/like-status')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.LIKE,
        })
        .expect(HttpStatus.NO_CONTENT);
      const resWithSet = await request(httpServer)
        .get('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .expect(HttpStatus.OK);
      expect(resWithSet.body.likesInfo.myStatus).toBe(LIKE_STATUS.LIKE);
      expect(resWithSet.body.likesInfo.likesCount).toBe(2);
    });
    it('should return comment with update status to dislike by user two', async () => {
      await request(httpServer)
        .put('/comments/' + comment.id + '/like-status')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.DISLIKE,
        })
        .expect(HttpStatus.NO_CONTENT);
      const resWithSet = await request(httpServer)
        .get('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .expect(HttpStatus.OK);
      expect(resWithSet.body.likesInfo.myStatus).toBe(LIKE_STATUS.DISLIKE);
      expect(resWithSet.body.likesInfo.likesCount).toBe(1);
      expect(resWithSet.body.likesInfo.dislikesCount).toBe(1);
    });
    it('should return comment with update status to none by user one', async () => {
      await request(httpServer)
        .put('/comments/' + comment.id + '/like-status')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          likeStatus: LIKE_STATUS.NONE,
        })
        .expect(HttpStatus.NO_CONTENT);
      const resWithSet = await request(httpServer)
        .get('/comments/' + comment.id)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(HttpStatus.OK);
      expect(resWithSet.body.likesInfo.myStatus).toBe(LIKE_STATUS.NONE);
      expect(resWithSet.body.likesInfo.likesCount).toBe(0);
      expect(resWithSet.body.likesInfo.dislikesCount).toBe(1);
    });
  });
});
