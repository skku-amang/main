// Import this first!
import "./instrument"

import * as Sentry from "@sentry/nestjs"
import { ConfigService } from "@nestjs/config"
import { HttpAdapterHost, NestFactory } from "@nestjs/core"
import cookieParser from "cookie-parser"
import { Logger, LoggerErrorInterceptor } from "nestjs-pino"
import { ZodValidationPipe } from "nestjs-zod"
import { AppModule } from "./app.module"
import { ALLOWED_ORIGINS } from "./common/allowed-origins"
import { AllErrorFilter } from "./common/filters/all-error.filter"
import { ApiErrorFilter } from "./common/filters/api-error.filter"
import { ZodValidationErrorFilter } from "./common/filters/zod-validation-error"
import { ApiResultInterceptor } from "./common/interceptors/api-result.interceptor"
import { originCheck } from "./common/middleware/origin-check.middleware"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  const httpAdapterHost = app.get(HttpAdapterHost)
  app.enableCors({
    origin: ALLOWED_ORIGINS,
    credentials: true
  })
  app.use(originCheck)
  app.use(cookieParser())
  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalFilters(
    new AllErrorFilter(httpAdapterHost),
    new ZodValidationErrorFilter(httpAdapterHost),
    new ApiErrorFilter(httpAdapterHost)
  )
  app.useGlobalInterceptors(
    new LoggerErrorInterceptor(),
    new ApiResultInterceptor()
  )
  // SIGTERM 시 처리 중인 요청을 마무리하고 onModuleDestroy 등 종료 훅 실행 (기본값 off)
  // useProcessExit: 컨테이너 PID 1은 자기 자신에게 다시 보낸 SIGTERM을 무시하므로 exit로 종료
  // 시그널 명시: 기본값은 SIGSEGV 등 치명적 오류 신호까지 들어 크래시가 exit 0으로 기록될 수 있음
  app.enableShutdownHooks(["SIGTERM", "SIGINT"], { useProcessExit: true })
  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>("PORT") ?? 8000)
}
bootstrap().catch(async (error: unknown) => {
  console.error(error)
  Sentry.captureException(error)
  await Sentry.flush(2000)
  process.exit(1)
})
