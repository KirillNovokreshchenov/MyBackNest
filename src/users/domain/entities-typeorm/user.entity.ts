import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmailConfirmation } from './email-confirm.entity';
import { RecoveryPassword } from './recovery-password.entity';
import { Session } from '../../../sessions/domain/entities-typeorm/session.entity';
import { PostLike } from '../../../posts/domain/entities-typeorm/post-like.entity';
import { CommentLike } from '../../../comments/domain/entities-typeorm/comment-like.entity';
import { Comment } from '../../../comments/domain/entities-typeorm/comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => EmailConfirmation, (ec) => ec.user)
  emailConfirms: EmailConfirmation[];
  @OneToMany(() => RecoveryPassword, (rp) => rp.user)
  recoveriesPassword: RecoveryPassword[];
  @OneToMany(() => Session, (s) => s.user)
  sessions: Session[];
  @OneToMany(() => PostLike, (pl) => pl.user)
  postLikes: PostLike[];
  @OneToMany(() => CommentLike, (cl) => cl.user)
  commentLikes: CommentLike[];
  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];
}
