import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from '../../../users/domain/entities-typeorm/user.entity';
import { LIKE_STATUS } from '../../../models/LikeStatusEnum';

@Entity()
@Check(`"likeStatus" in ('Like', 'Dislike')`)
@Unique(['postId', 'ownerId'])
export class PostLike {
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
  postId: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => Post, (p) => p.postLikes)
  @JoinColumn({ name: 'postId' })
  post: Post;
  @ManyToOne(() => User, (u) => u.postLikes)
  @JoinColumn({ name: 'ownerId' })
  user: User;
}
