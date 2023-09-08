import { PostLike } from "../../domain/post-like.schema";

export class NewestLikes {
  addedAt: string;
  userId: string;
  login: string;
  constructor(like: PostLike) {
    this.login = like.login;
    this.userId = like.userId.toString();
    this.addedAt = like.addedAt.toISOString();
  }
}
