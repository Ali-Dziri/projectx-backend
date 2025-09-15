import { Test, TestingModule } from '@nestjs/testing';
import { DisplaysService } from './displays.service';

describe('DisplaysService', () => {
  let service: DisplaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisplaysService],
    }).compile();

    service = module.get<DisplaysService>(DisplaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
