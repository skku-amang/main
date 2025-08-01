import { ConfigService } from "@nestjs/config"
import { HttpAdapterHost, NestFactory } from "@nestjs/core"
import cookieParser from "cookie-parser"
import { ZodValidationPipe } from "nestjs-zod"
import { AppModule } from "./app.module"
import { ApiErrorFilter } from "./common/filters/api-error.filter"
import { ApiResultInterceptor } from "./common/interceptors/api-result.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const httpAdapterHost = app.get(HttpAdapterHost)
  app.use(cookieParser())
  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalFilters(new ApiErrorFilter(httpAdapterHost))
  app.useGlobalInterceptors(new ApiResultInterceptor())
  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>("PORT") ?? 8000)
}
bootstrap()
