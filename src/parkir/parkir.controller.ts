import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParkirService } from './parkir.service';
import { CreateParkirDto } from './dto/create-parkir.dto';
import { UpdateParkirDto } from './dto/update-parkir.dto';

@Controller('parkir')
export class ParkirController {
  constructor(private readonly parkirService: ParkirService) {}

  @Post()
  create(@Body() createParkirDto: CreateParkirDto) {
    return this.parkirService.create(createParkirDto);
  }

  @Get()
  findAll() {
    return this.parkirService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parkirService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParkirDto: UpdateParkirDto) {
    return this.parkirService.update(+id, updateParkirDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parkirService.remove(+id);
  }
}
