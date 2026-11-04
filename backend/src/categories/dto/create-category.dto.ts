import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  name: string;

  @IsString()
  @IsIn(['INCOME', 'EXPENSE'], { message: 'Tipe kategori harus INCOME atau EXPENSE' })
  type: 'INCOME' | 'EXPENSE';

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'Warna harus berupa kode hex yang valid (contoh: #ef4444)',
  })
  color?: string;
}
