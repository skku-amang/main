FROM node:22-alpine AS base
RUN npm install -g pnpm turbo@^2

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .

RUN turbo prune web --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

# NEXT_PUBLIC_*는 빌드 때 번들에 박히므로 환경마다 이미지를 따로 만든다 (#749)
ARG APP_ENV
RUN test -n "$APP_ENV" && cp apps/web/env/${APP_ENV}.env apps/web/.env.production.local
RUN pnpm turbo run build --filter=web

# 실행에는 pnpm·turbo가 필요 없다 (standalone server.js)
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "apps/web/server.js"]