import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RecoveryPassword {
  @Column('uuid')
  recoveryCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @PrimaryColumn('uuid')
  userId: string;

  @ManyToOne(() => User, (u) => u.recoveriesPassword)
  @JoinColumn({ name: 'userId' })
  user: User;
}
