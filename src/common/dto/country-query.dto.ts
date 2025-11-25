import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import { COUNTRY_CODE_REGEX } from '../constants/validation';

export class CountryQueryDto {
  @ApiProperty({
    description: 'ISO-3166-1 alpha-2 country code',
    example: 'US',
  })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @Matches(COUNTRY_CODE_REGEX, {
    message: 'country must be an ISO-3166-1 alpha-2 code',
  })
  country!: string;
}
