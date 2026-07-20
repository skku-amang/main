# 처음 시작하기

AMANG 개발 환경을 처음부터 끝까지 세팅하고, 로컬에서 웹·API가 뜨는 것까지 확인하는 안내입니다. 순서대로 따라오면 됩니다.

## 사전 요구사항

- **Node.js** >= 20.9.0
- **Docker** (PostgreSQL, MinIO 실행용)
- **direnv** (선택 — MCP 도구 연동 시 필요)

## 1. 원커맨드 셋업

```bash
git clone https://github.com/skku-amang/main.git
cd main
./scripts/setup.sh
```

`scripts/setup.sh`가 다음을 자동으로 처리합니다.

- pnpm 활성화 및 의존성 설치
- 환경변수 파일 복사 (로컬 개발 기본값)
- Docker 컨테이너 기동 (PostgreSQL, MinIO)
- DB 마이그레이션 적용 + 시드 데이터 삽입

## 2. 개발 서버 실행

```bash
pnpm dev
```

아래 주소가 뜨면 성공입니다.

- 웹: http://localhost:3000
- API: http://localhost:8000
- MinIO 콘솔: http://localhost:9001

## 다음 단계

- 자주 쓰는 명령어 → [reference/commands.md](../reference/commands.md)
- 기여 워크플로 (이슈 → 브랜치 → PR) → [how-to/contributing.md](../how-to/contributing.md)
- 도메인 모델 이해 → [reference/domain-model.md](../reference/domain-model.md)

---

<details>
<summary>수동 셋업 (참고용 — <code>setup.sh</code>가 실패할 때만)</summary>

```bash
# 1. pnpm 활성화 및 의존성 설치
corepack enable
pnpm install

# 2. 환경변수 복사 (기본값이 로컬 개발에 맞게 설정되어 있음)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp packages/database/.env.example packages/database/.env

# 3. Docker 컨테이너 실행 (PostgreSQL, MinIO)
docker compose -f apps/api/docker-compose.yml up -d

# 4. DB 셋업
cd packages/database
pnpm db:generate    # Prisma 클라이언트 생성
cd ../..
pnpm db:deploy      # 마이그레이션 적용
cd packages/database
pnpm db:seed        # 시드 데이터 삽입
```

</details>
