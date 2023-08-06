import { User } from '../../../users/domain/user.schema';

export class UserAuthViewModel {
  userId: string;
  login: string;
  email: string;
  constructor(user: User) {
    this.userId = user._id.toString();
    this.login = user.login;
    this.email = user.email;
  }
}
