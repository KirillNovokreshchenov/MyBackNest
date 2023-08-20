import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { BlogExistsRule } from '../../../posts/validators/custom-blogId.validator';
import { BanDto } from './BanDto';

export class BanUserForBlogDto extends BanDto {
  @Validate(BlogExistsRule)
  @IsNotEmpty()
  @IsString()
  blogId: string;
}
