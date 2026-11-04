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

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul transaksi wajib diisi' })
  title: string;

  @Type(() => Number)
  @IsInt({ message: 'Nominal harus berupa bilangan bulat' })
  @IsPositive({ message: 'Nominal harus bernilai positif lebih dari 0' })
  amount: number;

  @IsString()
  @IsIn(['INCOME', 'EXPENSE'], { message: 'Tipe transaksi harus INCOME atau EXPENSE' })
  type: 'INCOME' | 'EXPENSE';

  @IsDateString({}, { message: 'Format tanggal tidak valid (gunakan ISO 8601 atau YYYY-MM-DD)' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: 'Kategori transaksi wajib dipilih' })
  categoryId: string;

  @IsOptional()
  @IsString()
  note?: string;
}
