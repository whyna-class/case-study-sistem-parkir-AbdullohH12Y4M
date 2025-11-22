import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ParkirModule } from './parkir/parkir.module';

@Module({
  imports: [PrismaModule, ParkirModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
