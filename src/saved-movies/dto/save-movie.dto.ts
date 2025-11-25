import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, Matches } from 'class-validator';
import { COUNTRY_CODE_REGEX } from '../../common/constants/validation';

export class SaveMovieDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  movieId!: number;

  @ApiProperty({ example: 'US', description: 'Country where the user is watching' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @Matches(COUNTRY_CODE_REGEX)
  country!: string;
}
