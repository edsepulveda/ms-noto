import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    name: 'Email',
    example: 'example@gmail.com',
  })
  email: string;

  @MinLength(8, { message: 'Password should be at least 8 characters long' })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: 'Password',
    example: 'password123',
  })
  password: string;
}
