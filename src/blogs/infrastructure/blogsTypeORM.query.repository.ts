import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { IdType } from '../../models/IdType';
import {
  BlogTypeORMViewModel,
  BlogViewModel,
} from '../api/view-model/BlogViewModel';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { BlogQueryInputType } from '../api/input-model/BlogQueryInputType';
import { BlogViewModelAll } from '../api/view-model/BlogViewModelAll';
import { pagesCount } from '../../helpers/pages-count';
import { skipPages } from '../../helpers/skip-pages';
import { Blog } from '../domain/entities-typeorm/blog.entity';
import { BlogTypeORMQueryModel } from './models/BlogTypeORMQueryModel';

@Injectable()
export class BlogsTypeORMQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blog) protected blogsRepo: Repository<Blog>,
  ) {}

  async findBlog(blogId: string): Promise<BlogViewModel | RESPONSE_ERROR> {
    const blog = await this.blogsRepo.findOneBy({ blogId, isDeleted: false });
    if (!blog) return RESPONSE_ERROR.NOT_FOUND;
    return new BlogTypeORMViewModel(blog);
  }

  async findAllBlogs(dataQuery: BlogQueryInputType, userId?: IdType) {
    const dataAllBlogs = await this._dataAllBlogs(dataQuery, userId);

    const mapBlogs = dataAllBlogs.allBlogs.map(
      (blog) => new BlogTypeORMViewModel(blog),
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
    const query = new BlogTypeORMQueryModel(dataQuery);
    const condition = {
      name: ILike(query.searchNameTerm),
    };

    const skip = skipPages(query.pageNumber, query.pageSize);
    const [allBlogs, totalCount] = await this.blogsRepo.findAndCount({
      order: {
        [query.sortBy]: query.sortDirection,
      },
      where: condition,
      skip: skip,
      take: query.pageSize,
    });
    const countPages = pagesCount(totalCount, query.pageSize);

    return {
      totalCount,
      countPages,
      allBlogs,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
    };
  }
}
