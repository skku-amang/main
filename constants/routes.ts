export interface Route {
  name: string
  url: string | ((...args: string[]) => string)
}

interface Performance {
  CREATE: Route
  LIST: Route
  DETAIL: {
    index: Route
    TEAM: Team
  }
  EDIT: Route
}

interface Team {
  CREATE: Route
  LIST: Route
  DETAIL: Route
  EDIT: Route
}

interface Mypage {
  INDEX: Route
}

interface Routes {
  HOME: Route
  LOGIN: Route
  SIGNUP: Route
  PERFORMANCE: Performance
  MYPAGE: Mypage
}

const ROUTES: Routes = {
  HOME: {
    name: 'Home',
    url: '/'
  },
  LOGIN: {
    name: 'Log in',
    url: '/login'
  },
  SIGNUP: {
    name: 'Sign up',
    url: '/signup'
  },
  PERFORMANCE: {
    CREATE: {
      name: '공연 생성',
      url: '/performaces/create'
    },
    LIST: {
      name: '공연 목록',
      url: '/performaces/'
    },
    DETAIL: {
      index: {
        name: '공연 상세',
        url: (id: string) => `/performances/${id}`
      },
      TEAM: {
        CREATE: {
          name: '팀 생성',
          url: (performanceId: string) => `/performances/${performanceId}/teams/create`
        },
        LIST: {
          name: '팀 생성',
          url: (performanceId: string) => `/performances/${performanceId}/teams`
        },
        DETAIL: {
          name: '팀 상세',
          url: (performanceId: string, id: string) => `/performances/${performanceId}/teams/${id}`
        },
        EDIT: {
          name: '팀 수정',
          url: (performanceId: string, id: string) => `/performances/${performanceId}/teams/${id}`
        }
      }
    },
    EDIT: {
      name: '공연 수정',
      url: (id: string) => `/performances/${id}/edit`
    },
  },
  MYPAGE: {
    INDEX: {
      name: '마이페이지',
      url: '/mypage'
    }
  }
}

export default ROUTES