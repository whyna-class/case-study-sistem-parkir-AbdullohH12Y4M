import { IsNotEmpty, IsString, IsInt, IsIn, Min } from 'class-validator';

export class CreateParkirDto {
  @IsNotEmpty({ message: 'Plat nomor tidak boleh kosong' })
  @IsString()
  plat_nomor: string;

  @IsNotEmpty({ message: 'Jenis kendaraan tidak boleh kosong' })
  @IsIn(['roda2', 'roda4'], {
    message: 'Jenis kendaraan hanya boleh "roda2" atau "roda4"',
  })
  jenis_kendaraan: string;

  @IsNotEmpty({ message: 'Durasi tidak boleh kosong' })
  @IsInt({ message: 'Durasi harus berupa angka' })
  @Min(1, { message: 'Durasi harus lebih dari 0' })
  durasi: number;
}