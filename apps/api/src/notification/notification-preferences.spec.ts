import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundError } from "@repo/api-client"
import { NotificationService } from "./notification.service"
import { PrismaService } from "../prisma/prisma.service"

type StoredUser = {
  id: number
  mutedNotificationTypes: string[]
  quietHoursEnabled: boolean
  quietHoursStart: number
  quietHoursEnd: number
}

describe("NotificationService 알림 설정 (#708)", () => {
  let service: NotificationService
  let stored: StoredUser

  beforeEach(async () => {
    stored = {
      id: 7,
      mutedNotificationTypes: [],
      quietHoursEnabled: true,
      quietHoursStart: 23,
      quietHoursEnd: 8
    }
    const user = {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === stored.id ? stored : null
      ),
      update: jest.fn(async ({ data }: { data: Partial<StoredUser> }) =>
        Object.assign(stored, data)
      )
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: { user } }
      ]
    }).compile()
    service = module.get(NotificationService)
  })

  it("없는 사용자면 404", async () => {
    await expect(service.getPreferences(99)).rejects.toThrow(NotFoundError)
  })

  it("기본값은 끈 유형 없음, 방해금지 23–08", async () => {
    await expect(service.getPreferences(7)).resolves.toEqual({
      mutedTypes: [],
      quietHours: { enabled: true, start: 23, end: 8 }
    })
  })

  it("보낸 필드만 바꾸고 나머지는 유지한다", async () => {
    await expect(
      service.updatePreferences(7, { mutedTypes: ["TEAM_CREATED"] })
    ).resolves.toEqual({
      mutedTypes: ["TEAM_CREATED"],
      quietHours: { enabled: true, start: 23, end: 8 }
    })

    await expect(
      service.updatePreferences(7, {
        quietHours: { enabled: false, start: 22, end: 7 }
      })
    ).resolves.toEqual({
      mutedTypes: ["TEAM_CREATED"],
      quietHours: { enabled: false, start: 22, end: 7 }
    })
  })
})
