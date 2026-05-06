import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { Failure, InternalServerError } from "@repo/api-client"

@Catch()
export class AllErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllErrorFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Error: ${exception.name} - ${exception.message}`,
        exception.stack
      )
    } else {
      this.logger.error(
        `Unhandled Error: ${JSON.stringify(exception, null, 2)}`
      )
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const detail =
      exception instanceof HttpException
        ? (exception.getResponse() as any)?.message || exception.message
        : (exception as any)?.message ||
          "서버에서 처리되지 않은 오류가 발생했습니다."

    const internalServerError = new InternalServerError()

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        type: internalServerError.type,
        status: httpStatus,
        title: internalServerError.title,
        detail,
        instance: request.url
      }
    } satisfies Failure

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}
