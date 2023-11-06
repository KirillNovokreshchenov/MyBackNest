import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';
import { Post } from '../../../posts/domain/entities-typeorm/post.entity';
import { User } from '../../../users/domain/entities-typeorm/user.entity';
import { Comment } from './comment.entity';

@Entity()
@Check(`"likeStatus" in ('Like', 'Dislike')`)
@Unique(['commentId', 'ownerId'])
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  likeId: string;

  @Column()
  likeStatus: LIKE_STATUS;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column()
  commentId: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => Comment, (c) => c.commentLikes)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;
  @ManyToOne(() => User, (u) => u.commentLikes)
  @JoinColumn({ name: 'ownerId' })
  user: User;
}
