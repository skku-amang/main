# 자주 쓰는 명령어

```bash
pnpm dev                              # 모든 앱 개발 서버
pnpm dev --filter=web                 # 웹만 실행 (포트 3000)
pnpm dev --filter=api                 # API만 실행 (포트 8000)
pnpm build                            # 전체 빌드
pnpm build --filter=web               # 웹만 빌드
pnpm lint                             # ESLint
pnpm format                           # Prettier 체크
pnpm check-types                      # 타입 체크
```

## 데이터베이스

```bash
pnpm db:deploy                        # 마이그레이션 배포

cd packages/database
pnpm db:migrate                       # 개발 마이그레이션 생성
pnpm db:generate                      # Prisma 클라이언트 재생성
pnpm db:seed                          # 시드 데이터
```

## 테스트

```bash
cd apps/api && pnpm test              # 단위 테스트
cd apps/api && pnpm test:watch        # 감시 모드
cd apps/api && pnpm test:e2e          # E2E 테스트
```
