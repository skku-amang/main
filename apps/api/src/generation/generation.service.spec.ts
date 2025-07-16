import { Test, TestingModule } from '@nestjs/testing';
import { GenerationService } from './generation.service';

describe('GenerationService', () => {
  let service: GenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerationService],
    }).compile();

    service = module.get<GenerationService>(GenerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
