import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IdType } from '../../models/IdType';
import { RESPONSE_ERROR } from '../../models/RESPONSE_ERROR';
import { CreateBlogDto } from '../application/dto/CreateBlogDto';
import { UpdateBlogDto } from '../application/dto/UpdateBlogDto';
import { RESPONSE_SUCCESS } from '../../models/RESPONSE_SUCCESS';
import { Blog } from '../domain/entities-typeorm/blog.entity';

@Injectable()
export class BlogsTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blog) protected blogsRepo: Repository<Blog>,
  ) {}

  async findBlogId(blogId: string): Promise<IdType | RESPONSE_ERROR> {
    const blog = await this.blogsRepo.findOneBy({ blogId });
    if (!blog) return RESPONSE_ERROR.NOT_FOUND;
    return blog.blogId;
  }

  async createBlog(userId: IdType, blogDto: CreateBlogDto) {
    const blog = new Blog();
    blog.name = blogDto.name;
    blog.description = blogDto.description;
    blog.websiteUrl = blogDto.websiteUrl;
    await this.blogsRepo.save(blog);
    return blog.blogId;
  }

  async updateBlog(blogId: IdType, blogDto: UpdateBlogDto) {
    const isUpdated = await this.blogsRepo.update(blogId, {
      name: blogDto.name,
      description: blogDto.description,
      websiteUrl: blogDto.websiteUrl,
    });
    if (isUpdated.affected !== 1) return RESPONSE_ERROR.NOT_FOUND;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }

  async deleteBlog(blogId: string) {
    const isDeleted = await this.blogsRepo.update(blogId, { isDeleted: true });
    if (isDeleted.affected !== 1) return RESPONSE_ERROR.NOT_FOUND;
    return RESPONSE_SUCCESS.NO_CONTENT;
  }
}
