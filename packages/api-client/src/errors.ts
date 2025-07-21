export abstract class ApiError extends Error {
  abstract readonly type: string;
  abstract readonly status: number;
  abstract readonly title: string;

  constructor(
    message: string,
    public readonly detail?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApiError {
  readonly type = "/errors/not-found";
  readonly status = 404;
  readonly title = "Not Found";

  constructor(detail?: string) {
    super("요청하신 리소스를 찾을 수 없습니다", detail);
  }
}

export class InternalServerError extends ApiError {
  readonly type = "/errors/internal-server-error";
  readonly status = 500;
  readonly title = "Internal Server Error";

  constructor(detail?: string) {
    super("서버에서 오류가 발생했습니다", detail);
  }
}

export class ValidationError extends ApiError {
  readonly type = "/errors/validation-error";
  readonly status = 400;
  readonly title = "Validation Error";

  constructor(detail?: string) {
    super("입력값이 올바르지 않습니다", detail);
  }
}

export class AuthError extends ApiError {
  readonly type = "/errors/authentication-error";
  readonly status = 401;
  readonly title = "Authentication Error";

  constructor(detail?: string) {
    super("인증이 필요합니다", detail);
  }
}

export class ForbiddenError extends ApiError {
  readonly type = "/errors/forbidden";
  readonly status = 403;
  readonly title = "Forbidden";

  constructor(detail?: string) {
    super("접근 권한이 없습니다", detail);
  }
}

export class ConflictError extends ApiError {
  readonly type = "/errors/conflict";
  readonly status = 409;
  readonly title = "Conflict";

  constructor(detail?: string) {
    super("이미 존재하는 데이터입니다", detail);
  }
}
