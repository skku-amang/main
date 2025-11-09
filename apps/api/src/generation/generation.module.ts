import { Module } from "@nestjs/common"

import { GenerationController } from "./generation.controller"
import { GenerationService } from "./generation.service"

@Module({
  controllers: [GenerationController],
  providers: [GenerationService]
})
export class GenerationModule {}
