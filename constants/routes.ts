export interface Route {
  name: string
  url: string | ((...args: string[]) => string)
}

const ROUTES = {
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
  NOTICE: {
    CREATE: {
      name: '공지사항 생성',
      url: '/notices/create'
    },
    LIST: {
      name: '공지사항 목록',
      url: '/notices/'
    },
    DETAIL: {
      name: '공지사항 상세',
      url: (id: string) => `/notices/${id}`
    },
    EDIT: {
      name: '공지사항 수정',
      url: (id: string) => `/notices/${id}/edit`
    }
  },
  PERFORMANCE: {
    CREATE: {
      name: '공연 생성',
      url: '/performances/create'
    },
    LIST: {
      name: '공연 목록',
      url: '/performances/'
    },
    DETAIL: {
      name: '공연 상세',
      url: (id: string) => `/performances/${id}`
    },
    EDIT: {
      name: '공연 수정',
      url: (id: string) => `/performances/${id}/edit`
    }
  },
  TEAM: {
    CREATE: {
      name: '팀 생성',
      url: '/teams/create'
    },
    LIST: {
      name: '팀 생성',
      url: '/teams'
    },
    DETAIL: {
      name: '팀 상세',
      url: (id: string) => `/teams/${id}`
    },
    EDIT: {
      name: '팀 수정',
      url: (id: string) => `/teams/${id}`
    }
  },
  MEMBERS: {
    LIST: {
      name: '유저 목록',
      url: '/members'
    },
    DETAIL: {
      name: '유저 상세',
      url: (id: string) => `/members/${id}`
    }
  },
  MYPAGE: {
    INDEX: {
      name: '마이페이지',
      url: '/mypage'
    }
  }
}

export default ROUTES
