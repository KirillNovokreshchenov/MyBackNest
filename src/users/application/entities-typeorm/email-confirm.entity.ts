import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
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

@Entity()
export class Session {
  @PrimaryColumn('uuid')
  deviceId: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'timestamp with time zone' })
  lastActiveDate: Date;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (u) => u.sessions)
  @JoinColumn({ name: 'userId' })
  user: User;
}
