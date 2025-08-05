import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { Failure } from "@repo/api-client"

@Catch()
export class AllErrorFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  //TODO: Logger를 사용하여 상세한 에러 로그를 남기도록 수정해야 합니다.
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    // 별도의 Logger를 사용하여 에러 로그를 남기도록 수정할 예정입니다.
    console.error("Unhandled Error:", exception)

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const detail =
      exception instanceof HttpException
        ? (exception.getResponse() as any)?.message || exception.message
        : "서버에서 처리되지 않은 오류가 발생했습니다."

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        type: "/errors/internal-server-error",
        status: httpStatus,
        title: "Internal Server Error",
        detail: detail,
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
