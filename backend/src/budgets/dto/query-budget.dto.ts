import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryBudgetDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Format bulan harus YYYY-MM' })
  month?: string;
}
