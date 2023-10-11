import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IdType } from '../../models/IdType';
import {
  BlogSQLViewModel,
  BlogViewModel,
} from '../api/view-model/BlogViewModel';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { BlogQueryInputType } from '../api/input-model/BlogQueryInputType';
import { BlogViewModelAll } from '../api/view-model/BlogViewModelAll';
import { BlogSQLQueryModel } from './models/BlogSQLQueryModel';
import { pagesCount } from '../../helpers/pages-count';
import { skipPages } from '../../helpers/skip-pages';

@Injectable()
export class BlogsSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findBlog(blogId: IdType): Promise<BlogViewModel | RESPONSE_ERROR> {
    try {
      const blog = await this.dataSource.query(
        `
    SELECT blog_id, name, description, website_url as "websiteUrl", created_at as "createdAt", is_membership as "isMembership"
   FROM public.sa_blogs
   WHERE blog_id = $1 AND is_deleted <> true;
    `,
        [blogId],
      );
      return new BlogSQLViewModel(blog[0]);
    } catch (e) {
      return RESPONSE_ERROR.NOT_FOUND;
    }
  }

  async findAllBlogs(dataQuery: BlogQueryInputType, userId?: IdType) {
    const dataAllBlogs = await this._dataAllBlogs(dataQuery, userId);

    const mapBlogs = dataAllBlogs.allBlogs.map(
      (blog) => new BlogSQLViewModel(blog),
    );

    return new BlogViewModelAll(
      dataAllBlogs.countPages,
      dataAllBlogs.pageNumber,
      dataAllBlogs.pageSize,
      dataAllBlogs.totalCount,
      mapBlogs,
    );
  }

  async _dataAllBlogs(dataQuery: BlogQueryInputType, userId?: IdType) {
    const query = new BlogSQLQueryModel(dataQuery);
    let totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)
           FROM public.sa_blogs
           WHERE name ILIKE $1 AND is_deleted <> true;
    `,
      [query.searchNameTerm],
    );
    totalCount = +totalCount[0].count;
    const countPages = pagesCount(totalCount, query.pageSize);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allBlogs = await this.dataSource.query(
      `
    SELECT blog_id, name, description, website_url as "websiteUrl", created_at as "createdAt", is_membership as "isMembership"
   FROM public.sa_blogs
WHERE name ILIKE $1 AND is_deleted <> true
ORDER BY "${query.sortBy}" ${query.sortDirection}
LIMIT $2 OFFSET $3;
    `,
      [query.searchNameTerm, query.pageSize, skip],
    );
    return {
      totalCount,
      countPages,
      allBlogs,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
    };
  }
}
