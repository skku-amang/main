import { ProblemDocument } from "http-problem-details";
import { StatusCodes } from "http-status-codes";
import { Failure, Success } from "./api-result";

// 기본 에러 인터페이스
export interface ApiError {
  toProblemDocument(): ProblemDocument;
}

// 400 Bad Request 에러
export class ValidationError implements ApiError {
  constructor(public message: string) {}

  toProblemDocument(): ProblemDocument {
    return {
      type: "/errors/validation-error",
      title: "Validation Error",
      status: StatusCodes.BAD_REQUEST,
      detail: this.message,
    };
  }
}

// 401 Unauthorized 에러
export class AuthError implements ApiError {
  message = "인증이 필요합니다.";

  toProblemDocument(): ProblemDocument {
    return {
      type: "/errors/authentication-error",
      title: "Authentication Error",
      status: StatusCodes.UNAUTHORIZED,
      detail: this.message,
    };
  }
}

// 404 Not Found 에러
export class NotFoundError implements ApiError {
  message = "리소스를 찾을 수 없습니다.";

  toProblemDocument(): ProblemDocument {
    return {
      type: "/errors/not-found",
      title: "Resource Not Found",
      status: StatusCodes.NOT_FOUND,
      detail: this.message,
    };
  }
}

// 예측하지 못한 서버 에러
export class InternalServerError implements ApiError {
  message = "알 수 없는 서버 에러가 발생했습니다.";

  toProblemDocument(): ProblemDocument {
    return {
      type: "/errors/internal-server-error",
      title: "Internal Server Error",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: this.message,
    };
  }
}

/** 모든 예측 가능한 에러들의 유니온 타입 */
export type GeneralApiError =
  | ValidationError
  | AuthError
  | NotFoundError
  | InternalServerError;

export function createFailure(error: ApiError): Failure {
  return {
    isSuccess: false,
    isFailure: true,
    error: error.toProblemDocument(),
  };
}

export function createSuccess<T>(data: T): Success<T> {
  return {
    isSuccess: true,
    isFailure: false,
    data,
  };
}
