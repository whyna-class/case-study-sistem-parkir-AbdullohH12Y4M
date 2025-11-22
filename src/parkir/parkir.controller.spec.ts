import { Test, TestingModule } from '@nestjs/testing';
import { ParkirController } from './parkir.controller';
import { ParkirService } from './parkir.service';

describe('ParkirController', () => {
  let controller: ParkirController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParkirController],
      providers: [ParkirService],
    }).compile();

    controller = module.get<ParkirController>(ParkirController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
