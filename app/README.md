# 레포지토리 소개
아망 홈페이지 프로젝트를 위한 프론트엔드 서버입니다.


# 레포지토리 구조
```
frontend
├── .vscode             # vscode 설정: 코드 스타일, 디버깅 스크립트 등
├── app                 # 페이지: 각 페이지에서만 사용되는 컴포넌트는 _components에 종속
│   ├── _(errors)       # 에러 페이지
│   ├── _(general)      # 일반 페이지
│   ├── _(home)         # 홈 페이지
│   ├── api             # NextJS에서 실행될 API: AuthJS
│   ├── login           # 로그인 페이지
│   ├── globals.css     # 전역 CSS
│   └── layout.tsx      # 전역 레이아웃
├── components          # 컴포넌트: 1개 이상의 페이지에서 반복적으로 사용되는 컴포넌트
├── constants           # 상수
│   ├── apiEndpoints.ts # API 엔드포인트: API 호출시 사용
│   ├── routes.ts       # 페이지 경로: app 폴더의 페이지 경로
│   └── zodSchema.ts    # Zod 스키마: form 검증시 사용
├── lib                 # 라이브러리: 커스텀 훅, 유틸리티 함수
│   ├── auth            # 인증 관련 함수: AuthJS에서 사용
│   ├── fetch           # API 호출 wrapper 함수: API 호출시 사용
│   ├── youtube         # Youtube 관련 함수: Youtube API 호출시, 플레이어 생성시 사용
│   └── utils.ts        # 유틸리티 함수: 기타 유틸리티 함수
├── public              # 정적 파일: 이미지, 폰트, 아이콘 등
├── types               # 타입 정의: TypeScript 타입 정의
├── .env.local          # 환경 변수: 개발 환경에서 사용, 직접 설정 필요
├── .env.development    # 환경 변수: Staging 환경에서 사용
├── .eslintrc.js        # ESLint 설정: 코드 스타일 검사
├── .gitignore          # git 무시 파일: git에 올리지 않을 파일
├── .prettierrc         # Prettier 설정: 코드 포맷팅
├── auth.ts             # 인증 모듈: AuthJS
├── constants.json      # Shadcn 설정 파일
├── Dockerfile          # Docker 설정 파일
├── env.d.ts            # 환경 변수 타입 정의
├── middleware.ts       # 미들웨어: NextJS 미들웨어
├── next.config.mjs     # NextJS 설정 파일
├── package-lock.json   # npm 패키지 락 파일
├── package.json        # npm 패키지 설정 파일
├── postcss.config.js   # PostCSS 설정 파일
├── README.md           # README 파일
├── tailwind.config.js  # Tailwind CSS 설정 파일
└── tsconfig.json       # TypeScript 설정 파일
```



# 레포지토리 세팅
## 준비물
- git: https://git-scm.com/downloads
- node.js >= 20.18.0: https://nodejs.org/en/download/package-manager


## 사용법
### 1. 이 레포지토리를 클론합니다.
```bash
git clone https://github.com/skku-amang/frontend
```


### 2. 필요한 라이브러리를 설치합니다.
```bash
npm install
```

### 3. 디버그 서버 실행
```bash
npm start
```
또는 `F5`~~딸깍~~를 눌러 vscode 세팅을 이용하여 디버그 서버를 실행할 수 있습니다.
