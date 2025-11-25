import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { COUNTRY_CODE_REGEX } from '../../common/constants/validation';

export class ListMoviesQueryDto extends PaginationQueryDto {
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

  @ApiPropertyOptional({ description: 'Genre identifier filter', type: Number })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  genre?: number;

  @ApiPropertyOptional({
    description: 'Sort by release year (asc: year, desc: -year)',
    enum: ['year', '-year'],
    default: '-year',
  })
  @IsOptional()
  sort?: 'year' | '-year' = '-year';
}
