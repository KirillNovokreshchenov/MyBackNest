import * as bcrypt from 'bcrypt';

const saltHash = 10;
export class UserAdapter {
  static async hashPassword(password) {
    const hash = await bcrypt.hash(password, saltHash);
    return hash;
  }
}
