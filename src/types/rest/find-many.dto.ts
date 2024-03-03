import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IOrder } from '../sort-util.type';

export class FindManyParamsDto {
  @ApiPropertyOptional({
    description:
      'Search query (JSON stringified)\n\n' +
      'String modifiers: startsWith, endsWith, contains\n\n' +
      'Number & Date modifiers: gt, gte, lt, lte\n\n' +
      '{"name": "John", "email.contains": "@gmail.com", "id": 1, "createdAt.gte": "2021-01-01"}',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  perPage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    enum: IOrder,
  })
  @IsOptional()
  @IsEnum(IOrder)
  order?: IOrder;
}
