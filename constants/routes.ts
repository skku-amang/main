const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ADMIN: {
    INDEX: "/admin"
  },
  NOTICE: {
    CREATE: "/notices/create",
    LIST: "/notices",
    DETAIL: (id: number) => `/notices/${id}`,
    EDIT: (id: number) => `/notices/${id}/edit`
  },
  PERFORMANCE: {
    CREATE: "/performances/create",
    LIST: "/performances",
    DETAIL: (id: number) => `/performances/${id}`,
    TEAM: {
      LIST: (id: number) => `/performances/${id}/teams`,
      DETAIL: (performanceId: number, teamId: number) => `/performances/${performanceId}/teams/${teamId}/detail`,
      EDIT: (performanceId: number, teamId: number) => `/performances/${performanceId}/teams/${teamId}edit`
    },
    EDIT: (id: number) => `/performances/${id}/edit`
  },
  TEAM: {
    CREATE: "/teams/create",
  },
  MEMBER: {
    LIST: "/members",
    DETAIL: (id: number) => `/members/${id}`
  },
  PROFILE: {
    INDEX: "/profile"
  }
}

export default ROUTES
