import { Test, TestingModule } from '@nestjs/testing';
import { ParkirService } from './parkir.service';

describe('ParkirService', () => {
  let service: ParkirService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParkirService],
    }).compile();

    service = module.get<ParkirService>(ParkirService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
