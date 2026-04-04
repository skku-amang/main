export const DEFAULT_PERFORMANCE_ID = 1

const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ADMIN: {
    INDEX: "/admin",
    USERS: "/admin/users",
    PENDING_USERS: "/admin/pending-users",
    GENERATIONS: "/admin/generations",
    PERFORMANCES: "/admin/performances",
    TEAMS: "/admin/teams",
    TEAM_DETAIL: (teamId: number) => `/admin/teams/${teamId}`,
    SESSIONS: "/admin/sessions",
    RENTALS: "/admin/rentals",
    EQUIPMENTS: "/admin/equipments"
  },
  NOTICE: {
    CREATE: "/notices/create",
    LIST: "/notices",
    DETAIL: (id: number) => `/notices/${id}`,
    EDIT: (id: number) => `/notices/${id}/edit`
  },
  PERFORMANCE: {
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
    INDEX: "/profile",
    EDIT: "/profile/edit",
    TEAMS: "/profile/teams"
  },
  RESERVATION: {
    CLUBROOM: "/reservations/clubroom",
    EQUIPMENT: "/reservations/equipment"
  }
}

export default ROUTES
