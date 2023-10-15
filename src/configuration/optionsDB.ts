import { configModule } from './ConfigModule';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './configuration';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { User } from '../users/domain/entities-typeorm/user.entity';
import { EmailConfirmation } from '../users/domain/entities-typeorm/email-confirm.entity';
import { RecoveryPassword } from '../users/domain/entities-typeorm/recovery-password.entity';
import { Session } from '../sessions/domain/entities-typeorm/session.entity';
import { Blog } from '../blogs/domain/entities-typeorm/blog.entity';
import { Post } from '../posts/domain/entities-typeorm/post.entity';
import { PostLike } from '../posts/domain/entities-typeorm/post-like.entity';
import { Comment } from '../comments/domain/entities-typeorm/comment.entity';

export const optionsSQL: TypeOrmModuleAsyncOptions = {
  imports: [configModule],
  useFactory: (configService: ConfigService<ConfigType>) => ({
    type: 'postgres',
    // url: configService.get('sql.DB_URL', { infer: true }),
    host: configService.get('sql.HOST_DB', { infer: true }),
    port: configService.get('sql.PORT_DB', { infer: true }),
    username: configService.get('sql.USERNAME_DB', { infer: true }),
    password: configService.get('sql.PASSWORD_DB', { infer: true }),
    database: configService.get('sql.NAME_DB', { infer: true }),
    autoLoadEntities: false,
    synchronize: false,
    ssl: true,
  }),
  inject: [ConfigService],
};
export const optionsTypeORM: TypeOrmModuleAsyncOptions = {
  imports: [configModule],
  useFactory: (configService: ConfigService<ConfigType>) => ({
    type: 'postgres',
    // url: configService.get('sql.DB_URL', { infer: true }),
    host: configService.get('typeORM.HOST_DB', { infer: true }),
    port: configService.get('typeORM.PORT_DB', { infer: true }),
    username: configService.get('typeORM.USERNAME_DB', {
      infer: true,
    }),
    password: configService.get('typeORM.PASSWORD_DB', {
      infer: true,
    }),
    database: configService.get('typeORM.NAME_DB', { infer: true }),
    autoLoadEntities: true,
    synchronize: false,
    ssl: true,
  }),
  inject: [ConfigService],
};

export const entities = [
  User,
  EmailConfirmation,
  RecoveryPassword,
  Session,
  Blog,
  Post,
  PostLike,
  Comment,
];
