import {
  Controller,
  Get,
  INestApplication,
  PayloadTooLargeException
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { App } from "supertest/types"

import { AllErrorFilter } from "./all-error.filter"

@Controller("test")
class TestController {
  @Get("too-large")
  tooLarge() {
    throw new PayloadTooLargeException()
  }

  @Get("crash")
  crash() {
    throw new Error("boom")
  }
}

describe("AllErrorFilter", () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController]
    }).compile()

    app = moduleRef.createNestApplication({ logger: false })
    app.useGlobalFilters(new AllErrorFilter(app.get(HttpAdapterHost)))
    await app.init()
  })

  afterAll(() => app.close())

  it("없는 경로는 404와 not-found 타입으로 응답한다", async () => {
    const res = await request(app.getHttpServer()).get("/no-such-route")

    expect(res.status).toBe(404)
    expect(res.body.error).toMatchObject({
      type: "/errors/not-found",
      status: 404
    })
  })

  it("대응하는 에러 타입이 없는 4xx도 원래 상태 코드로 응답한다", async () => {
    const res = await request(app.getHttpServer()).get("/test/too-large")

    expect(res.status).toBe(413)
    expect(res.body.error.status).toBe(413)
  })

  it("HttpException이 아닌 에러는 500으로 응답한다", async () => {
    const res = await request(app.getHttpServer()).get("/test/crash")

    expect(res.status).toBe(500)
    expect(res.body.error).toMatchObject({
      type: "/errors/internal-server-error",
      status: 500
    })
  })
})
