import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private queryBlogRepo: BlogsQueryRepository) {}

  async validate(value: string) {
    const blog = await this.queryBlogRepo.findBlog(new Types.ObjectId(value));
    if (!blog) return false;
    return true;
  }
  defaultMessage() {
    return `Blog doesn't exist`;
  }
}
