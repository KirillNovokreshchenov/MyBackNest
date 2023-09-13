import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  BlogMongoViewModel,
  BlogSQLViewModel,
  BlogViewModel,
} from '../api/view-model/BlogViewModel';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.schema';
import { BlogQueryInputType } from '../api/input-model/BlogQueryInputType';
import { BlogQueryModel } from './models/BlogQueryModel';
import { BlogViewModelAll } from '../api/view-model/BlogViewModelAll';
import { blogFilter } from '../blogs-helpers/blog-filter';
import { pagesCount } from '../../helpers/pages-count';
import { sortQuery } from '../../helpers/sort-query';
import { skipPages } from '../../helpers/skip-pages';
import { BlogByAdminViewModel } from '../api/view-model/BlogByAdminViewModel';
import { IdType } from '../../models/IdType';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogSQLQueryModel } from './models/BlogSQLQueryModel';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findAllBlogs(dataQuery: BlogQueryInputType, userId?: IdType) {
    const query = new BlogQueryModel(dataQuery);
    const filter = blogFilter(query.searchNameTerm, userId);
    filter['banInfo.isBanned'] = { $ne: true };
    const dataAllBlogs = await this._dataAllBlogs(query, filter, userId);

    const mapBlogs = dataAllBlogs.allBlogs.map(
      (blog) => new BlogMongoViewModel(blog),
    );

    return new BlogViewModelAll(
      dataAllBlogs.countPages,
      dataAllBlogs.pageNumber,
      dataAllBlogs.pageSize,
      dataAllBlogs.totalCount,
      mapBlogs,
    );
  }

  async findAllBlogsByAdmin(dataQuery: BlogQueryInputType) {
    const query = new BlogQueryModel(dataQuery);
    const filter = blogFilter(query.searchNameTerm);

    const dataAllBlogs = await this._dataAllBlogs(query, filter);

    console.log(dataAllBlogs.allBlogs);
    const mapBlogs = dataAllBlogs.allBlogs.map(
      (blog) => new BlogByAdminViewModel(blog),
    );

    return new BlogViewModelAll(
      dataAllBlogs.countPages,
      dataAllBlogs.pageNumber,
      dataAllBlogs.pageSize,
      dataAllBlogs.totalCount,
      mapBlogs,
    );
  }

  async _dataAllBlogs(query: BlogQueryModel, filter: any, userId?: IdType) {
    const totalCount = await this.BlogModel.countDocuments(filter);
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allBlogs = await this.BlogModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.pageSize)
      .lean();
    return {
      totalCount,
      countPages,
      allBlogs,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
    };
  }

  async findBlog(blogId: IdType): Promise<BlogViewModel | null> {
    const blog = await this.BlogModel.findOne({
      _id: blogId,
      'banInfo.isBanned': { $ne: true },
    }).lean();
    if (!blog) return null;
    return new BlogMongoViewModel(blog);
  }
}

export class BlogsSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findBlog(blogId: IdType): Promise<BlogViewModel | null> {
    const blog = await this.dataSource.query(
      `
    SELECT blog_id, name, description, website_url, created_at, is_membership
   FROM public.blogs
   WHERE blog_id = $1;
    `,
      [blogId],
    );
    if (!blog) return null;
    return new BlogSQLViewModel(blog[0]);
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
           FROM public.blogs
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
   FROM public.blogs
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
