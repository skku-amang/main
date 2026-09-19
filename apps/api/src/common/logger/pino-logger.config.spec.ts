import {
  Controller,
  Get,
  INestApplication,
  Module,
  ServiceUnavailableException
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import { ACCESS_TOKEN_COOKIE } from "@repo/shared-types"
import * as Sentry from "@sentry/nestjs"
import cookieParser from "cookie-parser"
import { LoggerModule } from "nestjs-pino"
import { Writable } from "stream"
import request from "supertest"
import { pinoLoggerModuleOption } from "./pino-logger.config"

jest.mock("@sentry/nestjs", () => ({
  ...jest.requireActual("@sentry/nestjs"),
  getActiveSpan: jest.fn()
}))

@Controller()
class PingController {
  @Get("ping")
  ping() {
    return { ok: true }
  }

  @Get("health/live")
  live() {
    return { status: "ok" }
  }

  @Get("health")
  ready() {
    throw new ServiceUnavailableException()
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

  afterEach(async () => {
    jest.mocked(Sentry.getActiveSpan).mockReset()
    await app.close()
  })

  const mockActiveSpan = (traceFlags: number) =>
    jest.mocked(Sentry.getActiveSpan).mockReturnValue({
      spanContext: () => ({ traceId: "a".repeat(32), spanId: "b", traceFlags })
    } as unknown as ReturnType<typeof Sentry.getActiveSpan>)

  it("성공한 헬스체크 요청은 기록하지 않는다", async () => {
    await request(app.getHttpServer()).get("/health/live").expect(200)

    expect(lines).toHaveLength(0)
  })

  it("실패한 헬스체크 요청은 기록한다", async () => {
    await request(app.getHttpServer()).get("/health").expect(503)

    expect(lines.some((line) => line.res?.statusCode === 503)).toBe(true)
  })

  it("샘플링된 트레이스면 trace_id를 기록한다", async () => {
    mockActiveSpan(1)
    await request(app.getHttpServer()).get("/ping").expect(200)

    expect(lines.every((line) => line.trace_id === "a".repeat(32))).toBe(true)
  })

  it("샘플링되지 않은 트레이스면 trace_id를 기록하지 않는다", async () => {
    mockActiveSpan(0)
    await request(app.getHttpServer()).get("/ping").expect(200)

    expect(lines.some((line) => "trace_id" in line)).toBe(false)
  })

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
