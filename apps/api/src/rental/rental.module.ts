import { Module } from "@nestjs/common"
import { RentalService } from "./rental.service"
import { RentalController } from "./rental.controller"

@Module({
  controllers: [RentalController],
  providers: [RentalService]
})
export class RentalModule {}
