// const baseURL =
//   process.env.NODE_ENV === "development"
//     ? process.env.NEXT_PUBLIC_LOCAL_URL
//     : process.env.NEXT_PUBLIC_DEPLOY_URL

/**
 * 실제 서비스 배포 전까지는 라이브 DB를 사용합니다.
 * 배포 후에는 다른 방법을 고안해야 합니다.
 */
const baseURL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_LOCAL_URL
    : process.env.NEXT_PUBLIC_DEPLOY_URL

const API_PREFIX = "api"

export interface ApiEndpoint {
  // eslint-disable-next-line no-unused-vars
  url: string | ((...args: any[]) => string)
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
}

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: {
      url: `${baseURL}/${API_PREFIX}/auth/`,
      method: "GET"
    },
    REGISTER: {
      url: `${baseURL}/${API_PREFIX}/auth/`,
      method: "POST"
    },
    LOGOUT: {
      url: `${baseURL}/${API_PREFIX}/auth/`,
      method: "DELETE"
    }
  },
  GENERATION: {
    CREATE: {
      url: `${baseURL}/${API_PREFIX}/generations/`,
      method: "POST"
    },
    LIST: {
      url: `${baseURL}/${API_PREFIX}/generations/`,
      method: "GET"
    },
    RETRIEVE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/generations/${id}`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/generations/${id}`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/generations/${id}`,
      method: "DELETE"
    })
  },
  PERFORMANCE: {
    CREATE: {
      url: `${baseURL}/${API_PREFIX}/performances/`,
      method: "POST"
    },
    LIST: {
      url: `${baseURL}/${API_PREFIX}/performances/`,
      method: "GET"
    },
    RETRIEVE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/performances/${id}`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/performances/${id}`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/performances/${id}`,
      method: "DELETE"
    })
  },
  SESSION: {
    CREATE: {
      url: `${baseURL}/${API_PREFIX}/sessions/`,
      method: "POST"
    },
    LIST: {
      url: `${baseURL}/${API_PREFIX}/sessions/`,
      method: "GET"
    },
    RETRIEVE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/sessions/${id}`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/sessions/${id}`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/sessions/${id}`,
      method: "DELETE"
    })
  },
  TEAM: {
    CREATE: {
      url: `${baseURL}/${API_PREFIX}/teams/`,
      method: "POST"
    },
    LIST: {
      url: `${baseURL}/${API_PREFIX}/teams/`,
      method: "GET"
    },
    RETRIEVE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/teams/${id}`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/teams/${id}`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/teams/${id}`,
      method: "DELETE"
    })
  },
  USER: {
    CREATE: {
      url: `${baseURL}/${API_PREFIX}/users/`,
      method: "POST"
    },
    LIST: {
      url: `${baseURL}/${API_PREFIX}/users/`,
      method: "GET"
    },
    RETRIEVE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/users/${id}`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/users/${id}`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/users/${id}`,
      method: "DELETE"
    })
  }
} as const

export default API_ENDPOINTS
