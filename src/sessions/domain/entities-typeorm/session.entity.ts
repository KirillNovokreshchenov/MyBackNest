import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../users/domain/entities-typeorm/user.entity';

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
