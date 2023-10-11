import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmailConfirmation } from '../../../users/domain/entities-typeorm/email-confirm.entity';
import { RecoveryPassword } from '../../../users/domain/entities-typeorm/recovery-password.entity';
import { Session } from '../../../sessions/domain/entities-typeorm/session.entity';
import { Post } from '../../../posts/domain/entities-typeorm/post.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  blogId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ default: false })
  isMembership: boolean;

  @Column({ default: false })
  isDeleted: boolean;
  @OneToMany(() => Post, (p) => p.blog)
  posts: Post[];
}
