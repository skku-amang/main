import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common"
import { ApiResult } from "@repo/api-client"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class ApiResultInterceptor<T> implements NestInterceptor<
  T,
  ApiResult<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResult<T>> {
    return next.handle().pipe(
      map((data) => ({
        isSuccess: true,
        isFailure: false,
        data
      }))
    )
  }
}
