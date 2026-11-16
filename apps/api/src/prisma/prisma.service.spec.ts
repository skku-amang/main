import { Test, TestingModule } from "@nestjs/testing"
import { PrismaService } from "./prisma.service"

describe("PrismaService", () => {
  let service: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService]
    }).compile()

    service = module.get<PrismaService>(PrismaService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("onModuleInit", () => {
    const unreachable = new Error("Can't reach database server")

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("DB가 늦게 뜨면 다시 시도해서 연결한다", async () => {
      jest
        .spyOn(service, "$connect")
        .mockRejectedValueOnce(unreachable)
        .mockRejectedValueOnce(unreachable)
        .mockResolvedValue(undefined)

      const init = service.onModuleInit()
      await jest.runAllTimersAsync()

      await expect(init).resolves.toBeUndefined()
    })

    it("끝까지 연결되지 않으면 마지막 오류를 던진다", async () => {
      jest.spyOn(service, "$connect").mockRejectedValue(unreachable)

      const init = service.onModuleInit()
      const assertion = expect(init).rejects.toBe(unreachable)
      await jest.runAllTimersAsync()

      await assertion
    })
  })
})
