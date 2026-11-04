import { IsInt, IsNotEmpty, IsPositive, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertBudgetDto {
  @IsString()
  @IsNotEmpty({ message: 'Kategori anggaran wajib dipilih' })
  categoryId: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Format bulan harus YYYY-MM' })
  month: string;

  @Type(() => Number)
  @IsInt({ message: 'Batas anggaran harus berupa bilangan bulat' })
  @IsPositive({ message: 'Batas anggaran harus lebih besar dari 0' })
  limitAmount: number;
}
