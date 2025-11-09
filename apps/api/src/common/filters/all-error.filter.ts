import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { Failure, InternalServerError } from "@repo/api-client"

@Catch()
export class AllErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  //TODO: Logger를 사용하여 상세한 에러 로그를 남기도록 수정해야 합니다.
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    // 별도의 Logger를 사용하여 에러 로그를 남기도록 수정할 예정입니다.
    console.error("Unhandled Error:", JSON.stringify(exception, null, 2))

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
