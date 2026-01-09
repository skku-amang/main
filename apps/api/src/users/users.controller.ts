import { Controller, Get, UseGuards } from "@nestjs/common"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { Public } from "../auth/decorators/public.decorator"
import { UsersService } from "./users.service"

@Controller("users")
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @Public()
  findAll() {
    return this.userService.findAll()
  }
}
