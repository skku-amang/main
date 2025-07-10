import { Performance, Team } from "shared-types";
import { ApiResult } from "./api-result";
import {
  ApiError,
  AuthError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "./errors";

/**
 * 서버에서 plain object로 전달되는 에러를
 * 자바스크립트의 에러 형식으로 변환합니다.
 */
function createErrorFromProblemDocument(problemDoc: any): ApiError {
  const detail = problemDoc.detail;

  switch (problemDoc.type) {
    case "/errors/not-found":
      return new NotFoundError(detail);
    case "/errors/internal-server-error":
      return new InternalServerError(detail);
    case "/errors/validation-error":
      return new ValidationError(detail);
    case "/errors/authentication-error":
      return new AuthError(detail);
    case "/errors/conflict":
      return new ConflictError(detail);
    default:
      return new InternalServerError(detail);
  }
}

export default class ApiClient {
  private static instance: ApiClient | null = null;

  constructor(private baseUrl: string) {}

  /**
   * ApiClient 싱글톤 인스턴스를 반환합니다.
   * 초기화되지 않은 경우 오류를 발생시킵니다.
   * @returns ApiClient 인스턴스
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      throw new Error(
        "ApiClient has not been initialized. Call ApiClient.initialize(config) first."
      );
    }
    return ApiClient.instance;
  }

  /**
   * 내부 API 요청 헬퍼 메소드
   */
  private async _request<T, E = ApiError>(
    endpoint: string, // 예: "/api/posts", "/api/projects/1" (항상 '/'로 시작 가정)
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {},
    };

    if (
      body &&
      (method === "POST" || method === "PUT" || method === "DELETE")
    ) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = (await response.json()) as ApiResult<T, E>;

      if (data.isSuccess) {
        return data.data;
      }
      throw createErrorFromProblemDocument(data.error);
    } catch (error) {
      // 네트워크 에러만 클라이언트에서 처리
      throw new InternalServerError();
    }
  }

  public async getPerformanceById(id: number) {
    return this._request<Performance, NotFoundError | InternalServerError>(
      `/api/performances/${id}`,
      "GET"
    );
  }

  /**
   * 팀 정보 조회
   * @throws {NotFoundError} 팀이 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getTeamById(id: number) {
    return this._request<Team, NotFoundError | InternalServerError>(
      `/api/teams/${id}`,
      "GET"
    );
  }
}
