import { Injectable } from '@nestjs/common';
import { verify, hash } from 'argon2';

@Injectable()
export class PasswordService {
  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await verify(hashedPassword, password);
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password);
  }
}
