const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PASSWORD_RESET: "/password-reset",
  ADMIN: {
    INDEX: "/admin",
    USERS: "/admin/users",
    PENDING_USERS: "/admin/pending-users",
    GENERATIONS: "/admin/generations",
    PERFORMANCES: "/admin/performances",
    PERFORMANCE_FEEDBACK: (performanceId: number) =>
      `/admin/performances/${performanceId}/feedback`,
    TEAMS: "/admin/teams",
    TEAM_DETAIL: (teamId: number) => `/admin/teams/${teamId}`,
    SESSIONS: "/admin/sessions",
    RENTALS: "/admin/rentals",
    EQUIPMENTS: "/admin/equipments"
  },
  PERFORMANCE: {
    LIST: "/performances",
    DETAIL: (id: number) => `/performances/${id}`,
    FEEDBACK: (id: number, teamId?: number) =>
      `/performances/${id}/feedback${teamId ? `?team=${teamId}` : ""}`,
    TEAM: {
      CREATE: (performanceId: number) =>
        `/performances/${performanceId}/teams/create`,
      LIST: (id: number) => `/performances/${id}/teams`,
      LATEST_LIST: "/performances/latest/teams",
      DETAIL: (performanceId: number, teamId: number) =>
        `/performances/${performanceId}/teams/${teamId}`,
      EDIT: (performanceId: number, teamId: number) =>
        `/performances/${performanceId}/teams/${teamId}/edit`
    }
  },
  PROFILE: {
    INDEX: "/profile",
    EDIT: "/profile/edit",
    TEAMS: "/profile/teams",
    DEVICES: "/profile/devices",
    NOTIFICATIONS: "/profile/notifications"
  },
  MEMBER_PROFILE: (userId: number) => `/profiles/${userId}`,
  SUGGESTIONS: "/suggestions",
  UPDATES: {
    LIST: "/updates",
    DETAIL: (slug: string) => `/updates/${encodeURIComponent(slug)}`
  },
  NOTIFICATIONS: "/notifications",
  RESERVATION: {
    CLUBROOM: "/reservations/clubroom",
    EQUIPMENT: "/reservations/equipment",
    EQUIPMENT_DETAIL: (id: number) => `/reservations/equipment/${id}`
  }
}

export default ROUTES
