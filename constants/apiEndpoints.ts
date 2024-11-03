const baseURL = process.env.NODE_ENV === "development" ?
  process.env.NEXT_PUBLIC_DEVELOPMENT_URL : `${process.env.NEXT_PUBLIC_DEPLOY_URL}:443`;
const API_PREFIX = "api"

export interface ApiEndpoint {
  // eslint-disable-next-line no-unused-vars
  url: string | ((...args: any[]) => string)
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
}

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: {
      url: `${baseURL}/${API_PREFIX}/backend/auth/login/`,
      method: "POST"
    },
    REGISTER: {
      url: `${baseURL}/${API_PREFIX}/backend/auth/register/`,
      method: "POST"
    },
    REFRESH: {
      url: `${baseURL}/${API_PREFIX}/backend/auth/refresh/`,
      method: "POST"
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
      url: `${baseURL}/${API_PREFIX}/generations/${id}/`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/generations/${id}/`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/generations/${id}/`,
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
      url: `${baseURL}/${API_PREFIX}/performances/${id}/`,
      method: "GET"
    }),
    RETRIEVE_TEAMS: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/performances/${id}/teams/`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/performances/${id}/`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/performances/${id}/`,
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
      url: `${baseURL}/${API_PREFIX}/sessions/${id}/`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/sessions/${id}/`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/sessions/${id}/`,
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
      url: `${baseURL}/${API_PREFIX}/teams/${id}/`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/teams/${id}/`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/teams/${id}/`,
      method: "DELETE"
    }),
    APPLY: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/teams/${id}/apply/`,
      method: "POST"
    }),
    UNAPPLY: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/teams/${id}/apply/`,
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
      url: `${baseURL}/${API_PREFIX}/users/${id}/`,
      method: "GET"
    }),
    UPDATE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/users/${id}/`,
      method: "PUT"
    }),
    DELETE: (id: number) => ({
      url: `${baseURL}/${API_PREFIX}/users/${id}/`,
      method: "DELETE"
    })
  }
} as const

export default API_ENDPOINTS
