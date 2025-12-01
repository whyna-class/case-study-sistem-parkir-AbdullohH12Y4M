import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { ParkirService } from './parkir.service';
import { CreateParkirDto } from './dto/create-parkir.dto';
import { UpdateParkirDto } from './dto/update-parkir.dto';
import { paginationParkirDto } from './dto/query-parkir.dto';

@Controller('parkir')
export class ParkirController {
  constructor(private readonly parkirService: ParkirService) {}

  @Post()
  create(@Body() createParkirDto: CreateParkirDto) {
    return this.parkirService.create(createParkirDto);
  }

  @Get()
  findAll(@Query(ValidationPipe) query: paginationParkirDto) {
  return this.parkirService.findAll(query);
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

  @Get('total')
  getTotalPendapatan() {
    return this.parkirService.getTotalPendapatan();
  }

  @Get('pendapatan/today')
  getPendapatanHariIni() {
    return this.parkirService.getPendapatanHariIni();
  }

  @Get('pendapatan/tanggal/:tanggal')
  getPendapatanByTanggal(@Param('tanggal') tanggal: string) {
    return this.parkirService.getPendapatanByTanggal(tanggal);
  }
}
