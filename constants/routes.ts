export interface Route {
  name: string
  url: string | ((...args: string[]) => string)
}

const ROUTES = {
  HOME: {
    name: "Home",
    url: "/"
  },
  LOGIN: {
    name: "Log in",
    url: "/login"
  },
  SIGNUP: {
    name: "Sign up",
    url: "/signup"
  },
  ADMIN: {
    INDEX: {
      name: "Admin",
      url: "/admin"
    }
  },
  NOTICE: {
    CREATE: {
      name: "공지사항 생성",
      url: "/notices/create"
    },
    LIST: {
      name: "공지사항 목록",
      url: "/notices"
    },
    DETAIL: (id: number) => ({
      name: "공지사항 상세",
      url: `/notices/${id}`
    }),
    EDIT: (id: number) => ({
      name: "공지사항 수정",
      url: `/notices/${id}/edit`
    })
  },
  PERFORMANCE: {
    CREATE: {
      name: "공연 생성",
      url: "/performances/create"
    },
    LIST: {
      name: "공연 목록",
      url: "/performances"
    },
    DETAIL: (id: number) => ({
      name: "공연 상세",
      url: `/performances/${id}`
    }),
    EDIT: (id: number) => ({
      name: "공연 수정",
      url: `/performances/${id}/edit`
    })
  },
  TEAM: {
    CREATE: {
      name: "팀 생성",
      url: "/teams/create"
    },
    LIST: {
      name: "팀 생성",
      url: "/teams"
    },
    DETAIL: (id: number) => ({
      name: "팀 상세",
      url: `/teams/${id}`
    }),
    EDIT: (id: number) => ({
      name: "팀 수정",
      url: `/teams/${id}/edit`
    })
  },
  MEMBER: {
    LIST: {
      name: "유저 목록",
      url: "/members"
    },
    DETAIL: (id: number) => ({
      name: "유저 상세",
      url: `/members/${id}`
    })
  },
  PROFILE: {
    INDEX: {
      name: "프로필",
      url: "/profile"
    }
  }
}

export default ROUTES
