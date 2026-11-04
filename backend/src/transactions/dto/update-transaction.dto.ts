import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Judul transaksi tidak boleh kosong' })
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Nominal harus berupa bilangan bulat' })
  @IsPositive({ message: 'Nominal harus bernilai positif lebih dari 0' })
  amount?: number;

  @IsOptional()
  @IsString()
  @IsIn(['INCOME', 'EXPENSE'], { message: 'Tipe transaksi harus INCOME atau EXPENSE' })
  type?: 'INCOME' | 'EXPENSE';

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Kategori transaksi tidak boleh kosong' })
  categoryId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
