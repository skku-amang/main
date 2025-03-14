export const DEFAULT_PERFORMANCE_ID = 1

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
      CREATE: (performanceId: number) =>
        `/performances/${performanceId}/teams/create`,
      LIST: (id: number) => `/performances/${id}/teams`,
      DETAIL: (performanceId: number, teamId: number) =>
        `/performances/${performanceId}/teams/${teamId}`,
      EDIT: (performanceId: number, teamId: number) =>
        `/performances/${performanceId}/teams/${teamId}/edit`
    },
    EDIT: (id: number) => `/performances/${id}/edit`
  },
  MEMBER: {
    LIST: "/members",
    DETAIL: (id: number) => `/members/${id}`
  },
  PROFILE: {
    INDEX: "/profile"
  },
  RESERVATION: {
    CLUBROOM: {
      CREATE: "/reservations/clubrooms/create",
      LIST: "/reservations/clubrooms",
      DETAIL: (id: number) => `/reservations/clubrooms/${id}`,
      EDIT: (id: number) => `/reservations/clubrooms/${id}/edit`
    },
    EQUIPMENT: {
      CREATE: "/reservations/equipments/create",
      LIST: "/reservations/equipments",
      DETAIL: (id: number) => `/reservations/equipments/${id}`,
      EDIT: (id: number) => `/reservations/equipments/${id}/edit`
    }
  }
}

export default ROUTES
