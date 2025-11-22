import { Injectable } from '@nestjs/common';
import { CreateParkirDto } from './dto/create-parkir.dto';
import { UpdateParkirDto } from './dto/update-parkir.dto';

@Injectable()
export class ParkirService {
  create(createParkirDto: CreateParkirDto) {
    return 'This action adds a new parkir';
  }

  findAll() {
    return `This action returns all parkir`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parkir`;
  }

  update(id: number, updateParkirDto: UpdateParkirDto) {
    return `This action updates a #${id} parkir`;
  }

  remove(id: number) {
    return `This action removes a #${id} parkir`;
  }
}
