import { Test, TestingModule } from '@nestjs/testing';
import { BatteriesController } from './batteries.controller';
import { BatteriesService } from './batteries.service';

describe('BatteriesController', () => {
  let controller: BatteriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatteriesController],
      providers: [BatteriesService],
    }).compile();

    controller = module.get<BatteriesController>(BatteriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
