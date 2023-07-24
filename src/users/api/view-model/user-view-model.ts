import { User } from '../../domain/user.schema';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  constructor(user: User) {
    this.id = user._id.toString();
    this.login = user.login;
    this.email = user.email;
    this.createdAt = user.createdAt;
  }
}
