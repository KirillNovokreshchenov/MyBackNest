export class UserSQlModel {
  user_id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo?: {
    isBanned: boolean | false;
    banDate: Date | null;
    banReason: string | null;
  };
}
