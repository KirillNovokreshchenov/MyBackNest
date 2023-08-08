import {
  ValidationArguments,
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
    try {
      await this.queryBlogRepo.findBlog(new Types.ObjectId(value));
    } catch (e) {
      return false;
    }
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return `Blog doesn't exist`;
  }
}
