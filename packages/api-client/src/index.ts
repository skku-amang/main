import { Team } from "shared-types";
import { ApiResult } from "./api-result";
import { ApiError, createFailure, createSuccess } from "./errors";

export function createResponse<T>(
  input:
    | {
        type: "success";
        data: T;
      }
    | {
        type: "error";
        error: ApiError;
      }
): ApiResult<T> {
  if (input.type === "success") {
    return createSuccess(input.data);
  } else {
    return createFailure(input.error);
  }
}

export default class ApiClient {
  private static instance: ApiClient | null = null;

  private constructor(private baseUrl: string) {}

  /**
   * ApiClient 싱글톤 인스턴스를 초기화합니다.
   * 이미 초기화된 경우 오류를 발생시킵니다.
   * @param config ApiClient 설정 객체 (baseUrl 포함)
   */
  public static initialize(baseUrl: string): void {
    if (ApiClient.instance) {
      console.warn("ApiClient has already been initialized.");
      return;
    }
    ApiClient.instance = new ApiClient(baseUrl);
  }

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
  private async _request<T>(
    endpoint: string, // 예: "/api/posts", "/api/projects/1" (항상 '/'로 시작 가정)
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any
  ): Promise<ApiResult<T>> {
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    return await response.json();
  }

  public async getTeamById(id: number) {
    return this._request<Team>(`/api/teams/${id}`, "GET");
  }
}
