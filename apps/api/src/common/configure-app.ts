import { INestApplication } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import cookieParser from "cookie-parser"
import { ZodValidationPipe } from "nestjs-zod"
import { AllErrorFilter } from "./filters/all-error.filter"
import { ApiErrorFilter } from "./filters/api-error.filter"
import { ZodValidationErrorFilter } from "./filters/zod-validation-error"
import { ApiResultInterceptor } from "./interceptors/api-result.interceptor"

export function configureApp(app: INestApplication): void {
  const httpAdapterHost = app.get(HttpAdapterHost)
  app.use(cookieParser())
  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalFilters(
    new AllErrorFilter(httpAdapterHost),
    new ZodValidationErrorFilter(httpAdapterHost),
    new ApiErrorFilter(httpAdapterHost)
  )
  app.useGlobalInterceptors(new ApiResultInterceptor())
}
