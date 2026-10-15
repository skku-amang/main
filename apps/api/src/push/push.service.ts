import { Injectable } from "@nestjs/common"
import {
  CreatePushSubscription,
  DeletePushSubscription
} from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class PushService {
  constructor(private readonly prisma: PrismaService) {}

  /** 같은 브라우저가 재구독하면 endpoint가 같으므로 소유자·키만 갱신한다 */
  subscribe(userId: number, { endpoint, keys }: CreatePushSubscription) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      update: { userId, p256dh: keys.p256dh, auth: keys.auth }
    })
  }

  /** 본인 소유 구독만 지운다 */
  unsubscribe(userId: number, { endpoint }: DeletePushSubscription) {
    return this.prisma.pushSubscription.deleteMany({
      where: { endpoint, userId }
    })
  }
}
