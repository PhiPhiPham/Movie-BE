import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { COUNTRY_CODE_REGEX } from '../../common/constants/validation';

export class ListSavedMoviesQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Country availability filter',
    example: 'US',
  })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @Matches(COUNTRY_CODE_REGEX)
  country!: string;

  @ApiPropertyOptional({
    enum: ['date_added', '-date_added'],
    default: '-date_added',
  })
  @IsOptional()
  @IsIn(['date_added', '-date_added'])
  sort?: 'date_added' | '-date_added' = '-date_added';
}
