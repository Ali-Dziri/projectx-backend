import { Test, TestingModule } from '@nestjs/testing';
import { DisplaysController } from './displays.controller';
import { DisplaysService } from './displays.service';

describe('DisplaysController', () => {
  let controller: DisplaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisplaysController],
      providers: [DisplaysService],
    }).compile();

    controller = module.get<DisplaysController>(DisplaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
