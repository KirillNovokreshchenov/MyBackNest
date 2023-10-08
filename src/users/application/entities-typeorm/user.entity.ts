import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmailConfirmation, Session } from './email-confirm.entity';
import { RecoveryPassword } from './recovery-password.entity';

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
}
