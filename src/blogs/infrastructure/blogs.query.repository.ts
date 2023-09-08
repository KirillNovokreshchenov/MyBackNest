import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { BlogViewModel } from "../api/view-model/BlogViewModel";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogModelType } from "../domain/blog.schema";
import { BlogQueryInputType } from "../api/input-model/BlogQueryInputType";
import { BlogQueryModel } from "./models/BlogQueryModel";
import { BlogViewModelAll } from "../api/view-model/BlogViewModelAll";
import { blogFilter } from "../blogs-helpers/blog-filter";
import { pagesCount } from "../../helpers/pages-count";
import { sortQuery } from "../../helpers/sort-query";
import { skipPages } from "../../helpers/skip-pages";
import { BlogByAdminViewModel } from "../api/view-model/BlogByAdminViewModel";
import { IdType } from "../../models/IdType";

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findAllBlogs(dataQuery: BlogQueryInputType, userId?: IdType) {
    const query = new BlogQueryModel(dataQuery);
    const filter = blogFilter(query.searchNameTerm, userId);
    filter['banInfo.isBanned'] = { $ne: true };
    const dataAllBlogs = await this._dataAllBlogs(query, filter, userId);

    const mapBlogs = dataAllBlogs.allBlogs.map(
      (blog) => new BlogViewModel(blog),
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

  async findBlog(
    blogId: IdType | Types.ObjectId,
  ): Promise<BlogViewModel | null> {
    const blog = await this.BlogModel.findOne({
      _id: blogId,
      'banInfo.isBanned': { $ne: true },
    }).lean();
    if (!blog) return null;
    return new BlogViewModel(blog);
  }
}
