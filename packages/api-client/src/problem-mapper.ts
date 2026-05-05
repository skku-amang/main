/**
 * ProblemDocument의 `type` URI를 typed ApiError 인스턴스로 변환.
 * 기존 src/index.ts (구 ApiClient)의 동명 함수와 동일 책임 — spec-derived 클라이언트도 이 mapper를 공유.
 */
import {
  AccessTokenExpiredError,
  AccessTokenNotFoundError,
  ApiError,
  AuthError,
  ConflictError,
  DuplicateApplicationError,
  DuplicateMemberIndexError,
  DuplicateSessionUserError,
  DuplicateTeamSessionError,
  ForbiddenError,
  InternalServerError,
  InvalidMemberIndexError,
  InvalidPerformanceDateError,
  NoApplicationFoundError,
  NotFoundError,
  PositionOccupiedError,
  type ProblemDocument,
  ReferencedEntityNotFoundError,
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError,
  SessionNotFoundError,
  UnprocessableEntityError,
  UserNotApprovedError,
  ValidationError
} from "./errors"

export function createErrorFromProblemDocument(
  problemDoc: ProblemDocument
): ApiError {
  const { detail, instance, type } = problemDoc

  switch (type) {
    case "/errors/validation-error":
      return new ValidationError(detail, instance)
    case "/errors/authentication-error":
      return new AuthError(detail, instance)
    case "/errors/forbidden":
      return new ForbiddenError(detail, instance)
    case "/errors/not-found":
      return new NotFoundError(detail, instance)
    case "/errors/conflict":
      return new ConflictError(detail, instance)
    case "/errors/unprocessable-entity":
      return new UnprocessableEntityError(detail, instance)
    case "/errors/internal-server-error":
      return new InternalServerError(detail, instance)
    case "/errors/team/duplicate-application":
      return new DuplicateApplicationError(detail, instance)
    case "/errors/team/position-occupied":
      return new PositionOccupiedError(detail, instance)
    case "/errors/team/session-not-found":
      return new SessionNotFoundError(detail, instance)
    case "/errors/team/no-application-found":
      return new NoApplicationFoundError(detail, instance)
    case "/errors/team/invalid-member-index":
      return new InvalidMemberIndexError(detail, instance)
    case "/errors/team/duplicate-member-index":
      return new DuplicateMemberIndexError(detail, instance)
    case "/errors/team/duplicate-session-user":
      return new DuplicateSessionUserError(detail, instance)
    case "/errors/team/duplicate-team-session":
      return new DuplicateTeamSessionError(detail, instance)
    case "/errors/team/referenced-entity-not-found":
      return new ReferencedEntityNotFoundError(detail, instance)
    case "/errors/performance/invalid-performance-date":
      return new InvalidPerformanceDateError(detail, instance)
    case "/errors/user/not-approved":
      return new UserNotApprovedError(detail, instance)
    case "/errors/token/refresh-token-expired":
      return new RefreshTokenExpiredError(detail, instance)
    case "/errors/token/refresh-token-not-found":
      return new RefreshTokenNotFoundError(detail, instance)
    case "/errors/token/access-token-expired":
      return new AccessTokenExpiredError(detail, instance)
    case "/errors/token/access-token-not-found":
      return new AccessTokenNotFoundError(detail, instance)
    default:
      return new InternalServerError()
  }
}
