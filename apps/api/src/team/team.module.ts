import { Module } from "@nestjs/common"
import { TeamService } from "./team.service"
import { TeamController } from "./team.controller"
import { ObjectStorageModule } from "../object-storage/object-storage.module"

@Module({
  imports: [ObjectStorageModule],
  controllers: [TeamController],
  providers: [TeamService]
})
export class TeamModule {}
