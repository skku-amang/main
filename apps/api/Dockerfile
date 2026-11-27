FROM node:22-alpine AS base
RUN npm install -g pnpm@10.13.1 turbo@^2

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .

RUN turbo prune api --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run db:generate --filter=@repo/database
RUN pnpm turbo run build --filter=api

# 이미지에 들어갈 바로 이 dist에 Debug ID를 새기고 map을 Sentry에 올린다 (#499).
# 토큰이 없으면(PR 빌드·로컬) 건너뛰고, 업로드가 실패해도 배포는 막지 않는다
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    if [ -n "$SENTRY_AUTH_TOKEN" ]; then \
      cd apps/api && \
      pnpm exec sentry-cli sourcemaps inject dist && \
      (pnpm exec sentry-cli sourcemaps upload --org amang-23 --project api dist \
        || echo "Sentry source map 업로드 실패 — 이미지는 그대로 만든다"); \
    fi

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app .

ENV NODE_ENV=production
# 배포 버전 (이미지 태그 <커밋시각>-<짧은 SHA>). 텔레메트리 app.version으로 보낸다 (src/instrument.ts)
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}
EXPOSE 8000
CMD ["node", "apps/api/dist/main.js"]