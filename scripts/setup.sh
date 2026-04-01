#!/usr/bin/env bash
set -euo pipefail

# ─── 색상 ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail()  { echo -e "${RED}[FAIL]${NC} $*"; exit 1; }

# ─── 프로젝트 루트로 이동 ───
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
info "프로젝트 루트: $PROJECT_ROOT"

# ─── 1. Prerequisites 체크 ───
info "Prerequisites 확인 중..."

# Node.js
if ! command -v node &>/dev/null; then
  fail "Node.js가 설치되어 있지 않습니다. https://nodejs.org 에서 설치해주세요."
fi
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  fail "Node.js 20 이상이 필요합니다. (현재: $(node -v))"
fi
ok "Node.js $(node -v)"

# Docker
if ! command -v docker &>/dev/null; then
  fail "Docker가 설치되어 있지 않습니다. https://docs.docker.com/get-docker/ 에서 설치해주세요."
fi
if ! docker info &>/dev/null; then
  fail "Docker 데몬이 실행 중이 아닙니다. Docker를 시작해주세요."
fi
ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')"

# direnv (선택)
if ! command -v direnv &>/dev/null; then
  warn "direnv가 설치되어 있지 않습니다. MCP 도구 연동 시 필요합니다."
  warn "설치: https://direnv.net/docs/installation.html"
  HAS_DIRENV=false
else
  ok "direnv $(direnv version)"
  HAS_DIRENV=true
fi

echo ""

# ─── 2. pnpm 활성화 ───
info "pnpm 활성화 중..."
corepack enable
corepack prepare --activate
ok "pnpm $(pnpm --version)"

echo ""

# ─── 3. 환경변수 파일 복사 ───
info "환경변수 파일 설정 중..."

copy_env() {
  local src="$1" dst="$2"
  if [ -f "$dst" ]; then
    warn "$dst 이미 존재 — 건너뜀"
  else
    cp "$src" "$dst"
    ok "$src → $dst 복사 완료"
  fi
}

copy_env apps/api/.env.example    apps/api/.env
copy_env apps/web/.env.example    apps/web/.env.local
copy_env packages/database/.env.example packages/database/.env

if [ "$HAS_DIRENV" = true ] && [ ! -f .envrc.local ]; then
  cp .envrc.local.example .envrc.local
  ok ".envrc.local.example → .envrc.local 복사 완료 (토큰은 직접 채워주세요)"
fi

echo ""

# ─── 4. direnv allow ───
if [ "$HAS_DIRENV" = true ]; then
  info "direnv allow 실행 중..."
  direnv allow
  ok "direnv allow 완료"
  echo ""
fi

# ─── 5. 의존성 설치 ───
info "의존성 설치 중... (시간이 걸릴 수 있습니다)"
pnpm install
ok "pnpm install 완료"

echo ""

# ─── 6. Docker Compose 실행 ───
info "Docker 컨테이너 시작 중 (PostgreSQL, MinIO)..."
docker compose -f apps/api/docker-compose.yml up -d
ok "Docker 컨테이너 시작 완료"

echo ""

# ─── 7. DB 준비 대기 → 마이그레이션 → 시드 ───
info "PostgreSQL 준비 대기 중..."
RETRIES=30
until docker exec postgres-db pg_isready -U postgres &>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    fail "PostgreSQL이 시작되지 않습니다. docker logs postgres-db 를 확인해주세요."
  fi
  sleep 1
done
ok "PostgreSQL 준비 완료"

info "Prisma 클라이언트 생성 중..."
(cd packages/database && pnpm db:generate)
ok "Prisma 클라이언트 생성 완료"

info "DB 초기화 중 (리셋 + 마이그레이션)..."
(cd packages/database && PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate reset --force --skip-seed)
ok "DB 마이그레이션 완료"

info "시드 데이터 삽입 중..."
(cd packages/database && SEED_DEFAULT_PASSWORD="${SEED_DEFAULT_PASSWORD:-Test1234%}" pnpm db:seed)
ok "시드 완료"

echo ""

# ─── 8. 완료 ───
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  셋업 완료!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  개발 서버 실행:  pnpm dev"
echo "  웹:             http://localhost:3000"
echo "  API:            http://localhost:8000"
echo "  MinIO 콘솔:     http://localhost:9001"
echo ""
if [ "$HAS_DIRENV" = true ] && [ -f .envrc.local ]; then
  echo -e "  ${YELLOW}[선택] MCP 도구 연동이 필요하면 .envrc.local에 토큰을 채워주세요.${NC}"
  echo ""
fi
