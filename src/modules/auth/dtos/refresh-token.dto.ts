import { IsString, IsJWT, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsJWT()
  @IsString()
  @ApiProperty({
    name: 'Refresh Token',
    example: 'eyJhbGci',
  })
  token: string;
}
