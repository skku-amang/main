import { ConfigService } from "@nestjs/config"
import { HttpAdapterHost, NestFactory } from "@nestjs/core"
import cookieParser from "cookie-parser"
import { ZodValidationPipe } from "nestjs-zod"
import { AppModule } from "./app.module"
import { AllErrorFilter } from "./common/filters/all-error.filter"
import { ApiErrorFilter } from "./common/filters/api-error.filter"
import { ZodValidationErrorFilter } from "./common/filters/zod-validation-error"
import { ApiResultInterceptor } from "./common/interceptors/api-result.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const httpAdapterHost = app.get(HttpAdapterHost)
  app.enableCors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      "https://amang.json-server.win",
      "https://amang-staging.json-server.win",
      /\.vercel\.app$/
    ],
    credentials: true
  })
  app.use(cookieParser())
  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalFilters(
    new AllErrorFilter(httpAdapterHost),
    new ZodValidationErrorFilter(httpAdapterHost),
    new ApiErrorFilter(httpAdapterHost)
  )
  app.useGlobalInterceptors(new ApiResultInterceptor())
  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>("PORT") ?? 8000)
}
bootstrap()
