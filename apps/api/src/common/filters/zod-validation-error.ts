import { ExceptionFilter, Catch, ArgumentsHost, Logger } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { ValidationError, Failure } from "@repo/api-client"
import { ZodValidationException } from "nestjs-zod"
import { fromZodError } from "zod-validation-error/v3"

@Catch(ZodValidationException)
export class ZodValidationErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ZodValidationErrorFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ZodValidationException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    const predefinedError = new ValidationError()
    const zodError = exception.getZodError()
    const validationError = fromZodError(zodError, { prefix: null })

    this.logger.warn(
      `Validation failed: ${validationError.message} [${request.method} ${request.url}]`
    )

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        type: predefinedError.type,
        status: predefinedError.status,
        title: predefinedError.title,
        detail: validationError.message,
        instance: request.url
      }
    } satisfies Failure

    httpAdapter.reply(ctx.getResponse(), responseBody, predefinedError.status)
  }
}
