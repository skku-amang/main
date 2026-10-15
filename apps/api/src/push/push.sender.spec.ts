import { Test, TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import * as webpush from "web-push"
import { PushSender } from "./push.sender"
import { PrismaService } from "../prisma/prisma.service"

jest.mock("web-push", () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
  WebPushError: class WebPushError extends Error {
    constructor(
      message: string,
      readonly statusCode: number,
      readonly headers: Record<string, string> = {},
      readonly body = "",
      readonly endpoint = ""
    ) {
      super(message)
    }
  }
}))

const sendNotification = webpush.sendNotification as jest.Mock

const message = { title: "팀A", body: "홍길동님이 합류했습니다", href: "/x" }

describe("PushSender", () => {
  let sender: PushSender
  let prisma: {
    pushSubscription: { findMany: jest.Mock; deleteMany: jest.Mock }
  }

  const makeSender = async (env: Record<string, string>) => {
    prisma = {
      pushSubscription: {
        findMany: jest.fn(async () => [
          { id: 1, endpoint: "https://push/ok1", p256dh: "p", auth: "a" },
          { id: 2, endpoint: "https://push/gone", p256dh: "p", auth: "a" },
          { id: 3, endpoint: "https://push/ok2", p256dh: "p", auth: "a" }
        ]),
        deleteMany: jest.fn(async () => ({ count: 1 }))
      }
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushSender,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: (k: string) => env[k] } }
      ]
    }).compile()
    return module.get(PushSender)
  }

  beforeEach(() => {
    sendNotification.mockReset()
  })

  describe("VAPID 설정이 있을 때", () => {
    beforeEach(async () => {
      sender = await makeSender({
        VAPID_PUBLIC_KEY: "pub",
        VAPID_PRIVATE_KEY: "priv",
        VAPID_SUBJECT: "mailto:amang.skku@gmail.com"
      })
    })

    it("410 Gone인 구독만 지우고 나머지는 모두 보낸다", async () => {
      sendNotification.mockImplementation(async (sub: { endpoint: string }) => {
        if (sub.endpoint === "https://push/gone")
          throw new webpush.WebPushError("gone", 410)
        return { statusCode: 201 }
      })

      await sender.sendToUsers([7, 8], message)

      expect(sendNotification).toHaveBeenCalledTimes(3)
      expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledTimes(1)
      expect(prisma.pushSubscription.deleteMany.mock.calls[0][0]).toEqual({
        where: { id: { in: [2] } }
      })
    })

    it("푸시 본문은 title·body·href JSON", async () => {
      sendNotification.mockResolvedValue({ statusCode: 201 })

      await sender.sendToUsers([7], message)

      const [, payload] = sendNotification.mock.calls[0]
      expect(JSON.parse(payload)).toEqual(message)
    })

    it("그 외 실패(5xx)는 구독을 지우지 않고 넘어간다", async () => {
      sendNotification.mockRejectedValue(new webpush.WebPushError("boom", 500))

      await expect(sender.sendToUsers([7], message)).resolves.toBeUndefined()
      expect(prisma.pushSubscription.deleteMany).not.toHaveBeenCalled()
    })

    it("수신자가 없으면 아무것도 하지 않는다", async () => {
      await sender.sendToUsers([], message)
      expect(prisma.pushSubscription.findMany).not.toHaveBeenCalled()
    })
  })

  it("VAPID 설정이 없으면 보내지 않는다", async () => {
    sender = await makeSender({})

    await sender.sendToUsers([7], message)

    expect(sendNotification).not.toHaveBeenCalled()
  })
})
