/**
 * RFC 7807 표준을 따르는 에러 데이터 객체 타입
 * JSON으로 직렬화되어 클라이언트에 전달되는 실제 데이터의 형태입니다.
 */
export type ProblemDocument = {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
}

export abstract class ApiError extends Error {
  abstract readonly type: string
  abstract readonly status: number
  abstract readonly title: string

  constructor(
    message: string,
    public readonly detail?: string,
    public readonly instance?: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends ApiError {
  readonly type = "/errors/not-found"
  readonly status = 404
  readonly title = "Not Found"

  constructor(detail?: string, instance?: string) {
    super("요청하신 리소스를 찾을 수 없습니다", detail, instance)
  }
}

export class InternalServerError extends ApiError {
  readonly type = "/errors/internal-server-error"
  readonly status = 500
  readonly title = "Internal Server Error"

  constructor(detail?: string, instance?: string) {
    super("서버에서 오류가 발생했습니다", detail, instance)
  }
}

export class ValidationError extends ApiError {
  readonly type = "/errors/validation-error"
  readonly status = 400
  readonly title = "Validation Error"

  constructor(detail?: string, instance?: string) {
    super("입력값이 올바르지 않습니다", detail, instance)
  }
}

export class AuthError extends ApiError {
  readonly type = "/errors/authentication-error"
  readonly status = 401
  readonly title = "Authentication Error"

  constructor(detail?: string, instance?: string) {
    super("유효한 인증 정보가 필요합니다.", detail, instance)
  }
}

export class ForbiddenError extends ApiError {
  readonly type = "/errors/forbidden"
  readonly status = 403
  readonly title = "Forbidden"

  constructor(detail?: string, instance?: string) {
    super("접근 권한이 없습니다", detail, instance)
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

  constructor(detail?: string, instance?: string) {
    super("이미 존재하는 데이터입니다", detail, instance)
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

  constructor(detail?: string, instance?: string) {
    super("처리할 수 없는 엔티티입니다", detail, instance)
  }
}

// ----------------------------------
// Domain Specific Errors
// ----------------------------------

// ----------------------------------
// Team Specific Errors
// ----------------------------------

/**
 * 사용자가 이미 지원한 세션에 중복으로 지원했을 때 발생하는 오류입니다.
 */
export class DuplicateApplicationError extends ApiError {
  readonly type = "/errors/team/duplicate-application"
  readonly status = 409
  readonly title = "Conflict"

  constructor(detail?: string, instance?: string) {
    super("이미 해당 세션에 지원한 이력이 있습니다.", detail, instance)
  }
}

/**
 * 지원하려는 포지션(인덱스)을 이미 다른 사용자가 선점했을 때 발생하는 오류입니다.
 */
export class PositionOccupiedError extends ApiError {
  readonly type = "/errors/team/position-occupied"
  readonly status = 409
  readonly title = "Conflict"

  constructor(detail?: string, instance?: string) {
    super("해당 포지션은 이미 다른 사용자가 지원했습니다.", detail, instance)
  }
}

/**
 * 요청한 팀 내에 특정 세션이 존재하지 않을 때 발생하는 오류입니다.
 */
export class SessionNotFoundError extends ApiError {
  readonly type = "/errors/team/session-not-found"
  readonly status = 404
  readonly title = "Not Found"

  constructor(detail?: string, instance?: string) {
    super("해당 세션이 팀에 존재하지 않습니다.", detail, instance)
  }
}

/**
 * 지원 기록이 존재하지 않아 취소할 수 없을 때 발생하는 오류입니다.
 */
export class NoApplicationFoundError extends ApiError {
  readonly type = "/errors/team/no-application-found"
  readonly status = 404
  readonly title = "Not Found"

  constructor(detail?: string, instance?: string) {
    super("취소할 지원 기록을 찾을 수 없습니다.", detail, instance)
  }
}
