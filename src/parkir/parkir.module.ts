import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkirController } from './parkir.controller';
import { ParkirService } from './parkir.service';
// import { Parkir } from './entities/parkir.entity';

@Module({

  controllers: [ParkirController],
  providers: [ParkirService],
})
export class ParkirModule {}