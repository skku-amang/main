# Stage 1: Build the Next.js application
FROM node:22-alpine AS builder
WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

# 소스 복사 및 빌드
COPY . .
RUN pnpm build

# Stage 2: Create the production-ready image
FROM node:22-alpine AS runner
WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 프로덕션에 필요한 파일만 복사
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 프로덕션 의존성만 설치
RUN pnpm install --prod

# 프로덕션 환경 설정
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]