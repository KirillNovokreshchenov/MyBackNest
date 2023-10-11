import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmation {
  @Column('uuid')
  confirmationCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ default: false })
  isConfirmed: boolean;

  @PrimaryColumn('uuid')
  userId: string;

  @ManyToOne(() => User, (u) => u.emailConfirms)
  @JoinColumn({ name: 'userId' })
  user: User;
}
