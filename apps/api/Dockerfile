FROM node:22-alpine AS base
RUN npm install -g pnpm turbo@^2

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

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app .

ENV NODE_ENV=production
EXPOSE 8000
CMD ["node", "apps/api/dist/main.js"]