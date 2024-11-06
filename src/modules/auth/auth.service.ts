import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { RegisterUserDto } from './dtos/register-user.dto';
import { PasswordService } from './services/password.service';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from 'src/config/jwt/refresh.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: registerUserDto.email,
      },
    });

    if (user) {
      throw new ConflictException(
        'User with the email provided already exists',
      );
    }

    const hashedPassword = await this.passwordService.hashPassword(
      registerUserDto.password,
    );

    const data = await this.prisma.user.create({
      data: {
        email: registerUserDto.email,
        username: registerUserDto.username,
        password: hashedPassword,
        is_active: true,
        accountType: 'credentials',
      },
    });

    return data;
  }

  async login(userId: string, username?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!username) throw new UnauthorizedException('Username not found');

    if (!user) throw new UnauthorizedException('User not found');

    if (user && !user.is_active) {
      throw new UnauthorizedException('This user has been deactivated');
    }

    const tokens = this.generateTokens(user.id);

    return {
      user,
      tokens,
    };
  }

  async deactivateAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    if (user && !user.is_active) {
      throw new UnauthorizedException('This user is already deactivated');
    }

    const data = await this.prisma.user.update({
      where: { id: userId },
      data: {
        is_active: false,
      },
    });

    return { message: 'User has been deactivated', success: true, data };
  }

  async activateAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    if (user && user.is_active) {
      throw new UnauthorizedException('This user is already active');
    }

    const data = await this.prisma.user.update({
      where: { id: userId },
      data: {
        is_active: true,
      },
    });

    return { message: 'User has been activated', success: true, data };
  }

  async generateTokens(userId: string) {
    const payload = { userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatches = await this.passwordService.validatePassword(
      user.password,
      password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateGoogleUser(createUserDto: RegisterUserDto): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email: createUserDto.email },
    });

    if (user) return user;

    const newUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        username: createUserDto.username,
        accountType: 'google',
        is_active: true,
        password: createUserDto.password,
      },
    });

    return newUser;
  }
}
