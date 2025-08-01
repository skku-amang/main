export abstract class ApiError extends Error {
  abstract readonly type: string
  abstract readonly status: number
  abstract readonly title: string

  constructor(
    message: string,
    public readonly detail?: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends ApiError {
  readonly type = "/errors/not-found"
  readonly status = 404
  readonly title = "Not Found"

  constructor(detail?: string) {
    super("요청하신 리소스를 찾을 수 없습니다", detail)
  }
}

export class InternalServerError extends ApiError {
  readonly type = "/errors/internal-server-error"
  readonly status = 500
  readonly title = "Internal Server Error"

  constructor(detail?: string) {
    super("서버에서 오류가 발생했습니다", detail)
  }
}

export class ValidationError extends ApiError {
  readonly type = "/errors/validation-error"
  readonly status = 400
  readonly title = "Validation Error"

  constructor(detail?: string) {
    super("입력값이 올바르지 않습니다", detail)
  }
}

export class AuthError extends ApiError {
  readonly type = "/errors/authentication-error"
  readonly status = 401
  readonly title = "Authentication Error"

  constructor(detail?: string) {
    super("유효한 인증 정보가 필요합니다.", detail)
  }
}

export class ForbiddenError extends ApiError {
  readonly type = "/errors/forbidden"
  readonly status = 403
  readonly title = "Forbidden"

  constructor(detail?: string) {
    super("접근 권한이 없습니다", detail)
  }
}

/**
 * 요청이 서버의 현재 상태와 충돌하는 경우 발생하는 오류입니다.
 * @example 중복된 데이터 생성 시
 */
export class ConflictError extends ApiError {
  readonly type = "/errors/conflict"
  readonly status = 409
  readonly title = "Conflict"

  constructor(detail?: string) {
    super("이미 존재하는 데이터입니다", detail)
  }
}

/**
 * 요청 내용 자체에 문제가 있는 경우 발생하는 오류입니다.
 * JSON 문법은 올바르지만, 요청된 엔티티가 유효하지 않거나 처리할 수 없는 경우에 사용됩니다.
 * @example 유효하지 않은 외래 키 참조
 */
export class UnprocessableEntityError extends ApiError {
  readonly type = "/errors/unprocessable-entity"
  readonly status = 422
  readonly title = "Unprocessable Entity"

  constructor(detail?: string) {
    super("처리할 수 없는 엔티티입니다", detail)
  }
}
