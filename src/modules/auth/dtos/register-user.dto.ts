import { IsEmail, MinLength, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    name: 'Email',
    example: 'example@gmail.com',
  })
  email: string;

  @MinLength(8, { message: 'Password should 8 characters long' })
  @IsNotEmpty()
  @ApiProperty({
    name: 'Password',
    example: 'password123',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: 'Username',
    example: 'username',
  })
  username: string;
}
