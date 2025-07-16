import { Module } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';

@Module({
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
