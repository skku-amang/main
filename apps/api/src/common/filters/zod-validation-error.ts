import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { ValidationError, Failure } from "@repo/api-client"
import { ZodValidationException } from "nestjs-zod"
import { fromZodError } from "zod-validation-error/v3"

@Catch(ZodValidationException)
export class ZodValidationErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ZodValidationException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    const predefinedError = new ValidationError()
    const zodError = exception.getZodError()
    const validationError = fromZodError(zodError, { prefix: null })

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        type: predefinedError.type,
        status: predefinedError.status,
        title: predefinedError.title,
        detail: validationError.message,
        instance: request.url,
        "invalid-params": zodError.errors.map((error) => {
          const path = error.path.length > 0 ? error.path.join(".") : "root"
          return {
            path,
            code: error.code,
            message: error.message
          }
        })
      }
    } satisfies Failure

    httpAdapter.reply(ctx.getResponse(), responseBody, predefinedError.status)
  }
}
