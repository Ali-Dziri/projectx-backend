import { Test, TestingModule } from '@nestjs/testing';
import { BatteriesService } from './batteries.service';

describe('BatteriesService', () => {
  let service: BatteriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BatteriesService],
    }).compile();

    service = module.get<BatteriesService>(BatteriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
