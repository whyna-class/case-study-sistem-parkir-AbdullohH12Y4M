import { IsNotEmpty, IsString, IsInt, IsIn, Min } from 'class-validator';

export class CreateParkirDto {
  @IsNotEmpty({ message: 'Plat nomor tidak boleh kosong' })
  @IsString()
  platNomor: string;

  @IsNotEmpty({ message: 'Jenis kendaraan tidak boleh kosong' })
  @IsIn(['RODA2', 'RODA4'], {
    message: 'Jenis kendaraan hanya boleh "RODA2" atau "RODA4"',
  })
  jenisKendaraan: string;

  @IsNotEmpty({ message: 'Durasi tidak boleh kosong' })
  @IsInt({ message: 'Durasi harus berupa angka' })
  @Min(1, { message: 'Durasi harus lebih dari 0' })
  durasi: number;
}