import { UserViewModel } from './UserViewModel';
import { User } from '../../application/entities-typeorm/user.entity';

export class UserTypeOrmViewModel extends UserViewModel {
  constructor(user: User) {
    super();
    this.id = user.userId;
    this.login = user.login;
    this.email = user.email;
    this.createdAt = user.createdAt;
  }
}
