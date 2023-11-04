import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../../blogs/domain/entities-typeorm/blog.entity';
import { PostLike } from './post-like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  postId: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

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
  blogId: string;

  @ManyToOne(() => Blog, (b) => b.blogId)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;
  @OneToMany(() => PostLike, (pl) => pl.post)
  postLikes: PostLike[];
}
