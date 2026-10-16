import { Module } from "@nestjs/common"
import { TeamBookmarkController } from "./team-bookmark.controller"
import { TeamBookmarkService } from "./team-bookmark.service"

@Module({
  controllers: [TeamBookmarkController],
  providers: [TeamBookmarkService]
})
export class TeamBookmarkModule {}
