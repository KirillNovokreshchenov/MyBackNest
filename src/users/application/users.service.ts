import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../infrastructure/users.repository";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserModelType } from "../domain/user.schema";
import { EmailManagers } from "../../auth/application/managers/email.managers";
import { PasswordRecovery, PasswordRecoveryType } from "../../auth/domain/password-recovery.schema";
import { DeviceRepository } from "../../sessions/infrastructure/device.repository";
import { PostsRepository } from "../../posts/infrastructure/posts.repository";
import { CommentsRepository } from "../../comments/infractructure/comments.repository";
import { BlogsRepository } from "../../blogs/infrastructure/blogs.repository";

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailManagers,
    protected deviceRepo: DeviceRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(PasswordRecovery.name)
    private passwordRecoveryModel: PasswordRecoveryType,
    protected postRepo: PostsRepository,
    protected commentsRepo: CommentsRepository,
    protected blogsRepo: BlogsRepository,
  ) {}

  // async createUserByRegistration(userDto: CreateUserDto): Promise<boolean> {
  //   const newUser: UserDocument = await this.UserModel.createNewUser(
  //     userDto,
  //     this.UserModel,
  //   );
  //   newUser.createEmailConfirm();
  //   try {
  //     await this.emailManager.emailRegistration(newUser);
  //   } catch {
  //     return false;
  //   }
  //   await this.usersRepository.saveUser(newUser);
  //   return true;
  // }

  // async confirmByEmail(codeDto: CodeDto): Promise<boolean> {
  //   const user = await this.usersRepository.findUserByCode(codeDto.code);
  //   if (!user) return false;
  //   if (user.canBeConfirmed()) {
  //     user.emailConfirmation.isConfirmed = true;
  //     await this.usersRepository.saveUser(user);
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // async emailResending(emailDto: EmailDto) {
  //   const user = await this.usersRepository.findUserByEmailOrLogin(
  //     emailDto.email,
  //   );
  //   if (!user || user.emailConfirmation.isConfirmed) return false;
  //   user.createEmailConfirm();
  //   try {
  //     await this.emailManager.emailRegistration(user);
  //   } catch {
  //     return false;
  //   }
  //   await this.usersRepository.saveUser(user);
  //   return true;
  // }

  // async recoveryPassword(emailDto: EmailDto) {
  //   const user = await this.usersRepository.findUserByEmailOrLogin(
  //     emailDto.email,
  //   );
  //   if (!user) return;
  //   const pasRecovery = await this.passwordRecoveryModel.createRecovery(
  //     this.passwordRecoveryModel,
  //     emailDto.email,
  //   );
  //
  //   try {
  //     await this.emailManager.passwordRecovery(
  //       emailDto.email,
  //       pasRecovery.recoveryCode,
  //     );
  //   } catch {
  //     return;
  //   }
  //   await this.usersRepository.saveRecovery(pasRecovery);
  // }

  // async createUserByAdmin(userDto: CreateUserDto): Promise<Types.ObjectId> {
  //   const newUser: UserDocument = await this.UserModel.createNewUser(
  //     userDto,
  //     this.UserModel,
  //   );
  //
  //   await this.usersRepository.saveUser(newUser);
  //   return newUser._id;
  // }

  // async deleteUser(id: Types.ObjectId): Promise<boolean> {
  //   return this.usersRepository.deleteUser(id);
  // }

  // async newPassword(newPasswordDto: NewPasswordDto) {
  //   const pasRecovery = await this.usersRepository.findRecovery(
  //     newPasswordDto.recoveryCode,
  //   );
  //   if (!pasRecovery) return false;
  //   const user = await this.usersRepository.findUserByEmailOrLogin(
  //     pasRecovery.email,
  //   );
  //   if (!user) return false;
  //   if (pasRecovery.canBeRecovery(newPasswordDto.recoveryCode)) {
  //     await user.createHash(newPasswordDto.newPassword, user);
  //     await this.usersRepository.saveUser(user);
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // async userBan(userId: Types.ObjectId, banDto: BanDto) {
  //   const user = await this.usersRepository.findUserById(userId);
  //   if (!user) return false;
  //   if (banDto.isBanned && !user.banInfo.isBanned) {
  //     user.userBan(banDto);
  //     await this.usersRepository.saveUser(user);
  //     await this.deviceRepo.deleteAllSessionsBan(userId);
  //     await this.banUnbanContent(userId);
  //     await this._banUnbanLikesUser(userId, banDto.isBanned);
  //     return true;
  //   } else if (!banDto.isBanned && user.banInfo.isBanned) {
  //     user.userUnban();
  //     await this.usersRepository.saveUser(user);
  //     await this.banUnbanContent(userId);
  //     await this._banUnbanLikesUser(userId, banDto.isBanned);
  //     return true;
  //   }
  //   return true;
  // }
  // async banUnbanContent(userId: Types.ObjectId) {
  //   await this._banUnbanPostsUser(userId);
  //   await this._banUnbanCommentsUser(userId);
  // }
  // async _banUnbanPostsUser(userId: Types.ObjectId) {
  //   const posts = await this.postRepo.findPostsBan(userId);
  //   posts.map((post) => {
  //     post.isBannedPost();
  //     this.postRepo.savePost(post);
  //   });
  // }
  // async _banUnbanCommentsUser(userId: Types.ObjectId) {
  //   const comments = await this.commentsRepo.findCommentsBan(userId);
  //   comments.map((comment) => {
  //     comment.isBannedComment();
  //     this.commentsRepo.saveComment(comment);
  //   });
  // }
  // async _banUnbanLikesUser(userId: Types.ObjectId, isBanned: boolean) {
  //   const likesComment = await this.commentsRepo.findLikesBan(userId);
  //   await Promise.all(
  //     likesComment.map(async (like) => {
  //       like.isBannedLike();
  //       const comment = await this.commentsRepo.findComment(like.commentId);
  //       if (comment) {
  //         comment.countBan(like.likeStatus, isBanned);
  //         await this.commentsRepo.saveComment(comment);
  //       }
  //       await this.commentsRepo.saveStatus(like);
  //     }),
  //   );
  //   const likesPost = await this.postRepo.findLikesBan(userId);
  //   await Promise.all(
  //     likesPost.map(async (like) => {
  //       like.isBannedLike();
  //       const post = await this.postRepo.findPostDocument(like.postId);
  //       if (post) {
  //         post.countBan(like.likeStatus, isBanned);
  //         await this.postRepo.savePost(post);
  //       }
  //       await this.postRepo.saveStatus(like);
  //     }),
  //   );
  // }

  // async userBanForBlog(
  //   userId: Types.ObjectId,
  //   userOwnerBlogId: Types.ObjectId,
  //   banDto: BanUserForBlogDto,
  // ) {
  //   const blog = await this.blogsRepo.findBlogById(
  //     new Types.ObjectId(banDto.blogId),
  //   );
  //   if (!blog) return RESPONSE_OPTIONS.NOT_FOUND;
  //   if (blog.blogOwnerInfo.userId.toString() !== userOwnerBlogId.toString()) {
  //     return RESPONSE_OPTIONS.FORBIDDEN;
  //   }
  //   const user = await this.usersRepository.findUserById(userId);
  //   if (!user) return RESPONSE_OPTIONS.NOT_FOUND;
  //
  //   user.banUnbanUserForBlog(banDto);
  //   await this.usersRepository.saveUser(user);
  //   return RESPONSE_OPTIONS.NO_CONTENT;
  // }

  // async banBlog(blogId: Types.ObjectId, banBlogDto: BanBlogDto) {
  //   const blog = await this.blogsRepo.findBlogById(blogId);
  //   if (!blog) return false;
  //   blog.banUnbanBlog(banBlogDto);
  //   await this.blogsRepo.saveBlog(blog);
  //   await this._banUnbanBlogPosts(blogId);
  //   await this._banUnbanBlogComments(blogId);
  //   return true;
  // }
  // async _banUnbanBlogPosts(blogId: Types.ObjectId) {
  //   const posts = await this.postRepo.findPostsBlogBan(blogId);
  //   posts.map((post) => {
  //     post.isBannedPost();
  //     this.postRepo.savePost(post);
  //   });
  // }
  // async _banUnbanBlogComments(blogId: Types.ObjectId) {
  //   const comments = await this.commentsRepo.findCommentsBlogBan(blogId);
  //   comments.map((comment) => {
  //     comment.isBannedComment();
  //     this.commentsRepo.saveComment(comment);
  //   });
  // }
}
