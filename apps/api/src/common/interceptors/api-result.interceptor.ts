import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { ApiResult } from "@repo/api-client"

@Injectable()
export class ApiResultInterceptor<T>
  implements NestInterceptor<T, ApiResult<T>>
{
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
