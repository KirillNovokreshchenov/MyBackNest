import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../../posts/domain/entities-typeorm/post.entity';
import { PostLike } from '../../../posts/domain/entities-typeorm/post-like.entity';
import { CommentLike } from './comment-like.entity';
import { User } from '../../../users/domain/entities-typeorm/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  commentId: string;

  @Column()
  content: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column('uuid')
  postId: string;

  @Column('uuid')
  ownerId: string;

  @ManyToOne(() => Post, (p) => p.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;
  @ManyToOne(() => User, (u) => u.comments)
  @JoinColumn({ name: 'ownerId' })
  user: User;
  @OneToMany(() => CommentLike, (cl) => cl.comment)
  commentLikes: CommentLike[];
}
