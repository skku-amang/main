import { Controller, Get, INestApplication, Module } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import { ACCESS_TOKEN_COOKIE } from "@repo/shared-types"
import cookieParser from "cookie-parser"
import { LoggerModule } from "nestjs-pino"
import { Writable } from "stream"
import request from "supertest"
import { pinoLoggerModuleOption } from "./pino-logger.config"

@Controller()
class PingController {
  @Get("ping")
  ping() {
    return { ok: true }
  }
}

describe("pinoLoggerModuleOption", () => {
  let app: INestApplication
  let lines: Record<string, any>[]
  const accessToken = new JwtService().sign(
    { sub: 42 },
    { secret: "test-secret" }
  )

  beforeEach(async () => {
    lines = []
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        lines.push(JSON.parse(chunk.toString()))
        callback()
      }
    })

    @Module({
      imports: [
        LoggerModule.forRoot({
          ...pinoLoggerModuleOption,
          pinoHttp: { ...pinoLoggerModuleOption.pinoHttp, stream }
        })
      ],
      controllers: [PingController]
    })
    class TestModule {}

    app = (
      await Test.createTestingModule({ imports: [TestModule] }).compile()
    ).createNestApplication()
    app.use(cookieParser())
    await app.init()
  })

  afterEach(() => app.close())

  it("access token cookie가 있으면 userId를 기록한다", async () => {
    await request(app.getHttpServer())
      .get("/ping")
      .set("Cookie", `${ACCESS_TOKEN_COOKIE}=${accessToken}`)
      .expect(200)

    expect(lines.every((line) => line.userId === 42)).toBe(true)
  })

  it("cookie가 없으면 anonymous로 기록한다", async () => {
    await request(app.getHttpServer()).get("/ping").expect(200)

    expect(lines.every((line) => line.userId === "anonymous")).toBe(true)
  })

  it("cookie 헤더는 토큰이 담기므로 로그에서 가린다", async () => {
    await request(app.getHttpServer())
      .get("/ping")
      .set("Cookie", `${ACCESS_TOKEN_COOKIE}=${accessToken}`)
      .expect(200)

    const serialized = JSON.stringify(lines)
    expect(serialized).not.toContain(accessToken)
    expect(
      lines.some((line) => line.req?.headers?.cookie === "[Redacted]")
    ).toBe(true)
  })
})
