import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'Warna harus berupa kode hex yang valid (contoh: #ef4444)',
  })
  color?: string;
}
