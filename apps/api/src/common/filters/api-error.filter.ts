import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { ApiError, Failure } from "@repo/api-client"

@Catch(ApiError)
export class ApiErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ApiError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        type: exception.type,
        status: exception.status,
        title: exception.title,
        detail: exception.detail,
        instance: request.url
      }
    } satisfies Failure

    httpAdapter.reply(ctx.getResponse(), responseBody, exception.status)
  }
}
