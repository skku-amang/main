// Import this first!
import "./instrument"

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
  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>("PORT") ?? 8000)
}
bootstrap()
