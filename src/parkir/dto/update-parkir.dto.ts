import { IsInt, Min, IsOptional } from 'class-validator';

export class UpdateParkirDto {
  @IsOptional()
  @IsInt({ message: 'Durasi harus berupa angka' })
  @Min(1, { message: 'Durasi harus lebih dari 0' })
  durasi?: number;
}