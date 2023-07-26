import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogViewModel } from '../api/view-model/BlogViewModel';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.schema';
import { BlogQueryInputType } from '../api/input-model/BlogQueryInputType';
import { BlogQueryModel } from './models/BlogQueryModel';
import { BlogViewModelAll } from '../api/view-model/BlogViewModelAll';
import { blogFilter } from '../blogs-helpers/blog-filter';
import { pagesCount } from '../../helpers/pages-count';
import { sortQuery } from '../../helpers/sort-query';
import { skipPages } from '../../helpers/skip-pages';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findAllBlogs(dataQuery: BlogQueryInputType) {
    const query = new BlogQueryModel(dataQuery);

    const filter = blogFilter(query.searchNameTerm);

    const totalCount = await this.BlogModel.countDocuments(filter);
    const countPages = pagesCount(totalCount, query.pageSize);
    const sort = sortQuery(query.sortDirection, query.sortBy);
    const skip = skipPages(query.pageNumber, query.pageSize);

    const allBlogs = await this.BlogModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.pageSize)
      .lean();

    const mapBlogs = allBlogs.map((blog) => new BlogViewModel(blog));

    return new BlogViewModelAll(
      countPages,
      query.pageNumber,
      query.pageSize,
      totalCount,
      mapBlogs,
    );
  }

  async findBlog(blogId: Types.ObjectId): Promise<BlogViewModel | null> {
    const blog = await this.BlogModel.findById(blogId).lean();
    if (!blog) return null;
    return new BlogViewModel(blog);
  }
}
