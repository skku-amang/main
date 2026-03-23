# Vercel Staging 배포 환경 설계

## 목적

main 브랜치 push 시 production 배포(기존)와 함께 staging preview 배포를 자동 생성하여, `amang.staging.json-server.win`에서 staging API(`api.amang.staging.json-server.win`)에 연결된 프론트엔드를 확인할 수 있도록 한다.

## 배포 흐름

```
main push
├── Vercel Git Integration → production 빌드/배포 → amang.json-server.win
└── GitHub Actions → preview 빌드/배포 → amang.staging.json-server.win
```

Production과 staging은 **같은 커밋(main HEAD)**에서 빌드되며, 환경변수만 다르다.

## 환경변수

| Key                    | Production                          | Preview (Staging)                           |
| ---------------------- | ----------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | `https://api.amang.json-server.win` | `https://api.amang.staging.json-server.win` |
| `AUTH_SECRET`          | (random 32byte base64)              | (동일 값)                                   |
| `NEXT_PUBLIC_SITE_URL` | `https://amang.json-server.win`     | `https://amang.staging.json-server.win`     |

`NEXT_PUBLIC_SITE_URL`은 신규 추가. 나머지는 기존 설정 유지.

> **참고**: Preview 환경변수는 PR preview 배포에도 적용됨. PR preview에서 staging API를 사용하는 것이 현재 의도와 일치함 (기존 `NEXT_PUBLIC_API_URL` preview 설정도 동일 패턴).

## 변경 사항

### 1. Terraform — Vercel (`infra/terraform/vercel/main.tf`)

**추가할 리소스:**

```hcl
# Staging 도메인
resource "vercel_project_domain" "staging" {
  project_id = vercel_project.web.id
  domain     = "amang.staging.json-server.win"
}

# NEXT_PUBLIC_SITE_URL — production
resource "vercel_project_environment_variable" "site_url_production" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_SITE_URL"
  value      = "https://amang.json-server.win"
  target     = ["production"]
}

# NEXT_PUBLIC_SITE_URL — preview/development
resource "vercel_project_environment_variable" "site_url_preview" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_SITE_URL"
  value      = "https://amang.staging.json-server.win"
  target     = ["preview", "development"]
}
```

### 2. Terraform — Cloudflare (`~/homelab-worktrees/main/cloudflare/dns.tf`)

**변경할 리소스:** `cloudflare_record.amang_staging` (line 27-34)

기존 A 레코드(homelab IP) → CNAME(Vercel DNS)로 변경:

```hcl
# 변경 전
resource "cloudflare_record" "amang_staging" {
  zone_id = cloudflare_zone.main.id
  name    = "amang.staging"
  type    = "A"
  content = var.default_ip
  proxied = false
  comment = "AMANG staging web"
}

# 변경 후
resource "cloudflare_record" "amang_staging" {
  zone_id = cloudflare_zone.main.id
  name    = "amang.staging"
  type    = "CNAME"
  content = "cname.vercel-dns.com"
  proxied = false
  comment = "AMANG staging web (Vercel preview deployment)"
}
```

`proxied = false` 유지 — multi-level subdomain이므로 Cloudflare Universal SSL 미지원, Vercel이 TLS 처리.

### 3. GitHub Actions (`.github/workflows/deploy-staging.yml`) — 신규

main push 시 Vercel preview 배포를 생성하고 staging 도메인으로 alias:

```yaml
name: Deploy Staging

on:
  push:
    branches:
      - main

concurrency:
  group: deploy-staging
  cancel-in-progress: true

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy Preview
        id: deploy
        run: echo "url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})" >> $GITHUB_OUTPUT
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Alias to Staging Domain
        run: vercel alias ${{ steps.deploy.outputs.url }} amang.staging.json-server.win --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 4. GitHub Actions Secrets 설정

CLI로 설정 (수동 1회):

```bash
# Vercel API token (Terraform에서 사용 중인 동일 토큰)
gh secret set VERCEL_TOKEN --repo skku-amang/main

# Vercel 프로젝트 식별자 (.envrc에서 확인 가능)
gh secret set VERCEL_ORG_ID --repo skku-amang/main
gh secret set VERCEL_PROJECT_ID --repo skku-amang/main
```

`VERCEL_TOKEN`과 ID 값은 `--body` 없이 실행하여 프롬프트에서 입력.

## 적용 순서

1. **Terraform Vercel** — staging 도메인 + 환경변수 추가 (`terraform plan` → 사용자 승인 → `terraform apply`)
2. **Terraform Cloudflare** — DNS 레코드 변경 (`terraform plan` → 사용자 승인 → `terraform apply`)
3. **GHA Secrets** — `gh secret set` 명령 실행
4. **GHA Workflow** — `deploy-staging.yml` 커밋 & push
5. **검증** — main push 후 `amang.staging.json-server.win` 접근 확인

> Vercel 도메인을 먼저 등록해야 DNS가 Vercel을 가리킬 때 즉시 서빙 가능. 순서를 바꾸면 DNS 전환 후 Vercel이 도메인을 인식하지 못하는 짧은 다운타임 발생.

## 주의 사항

- Cloudflare DNS 변경 시 `amang.staging.json-server.win`이 homelab IP에서 Vercel로 전환됨 (사용자 확인 완료).
- `*.amang.staging.json-server.win` 와일드카드 레코드는 변경하지 않음 — API 등 다른 staging 서비스는 여전히 homelab으로 연결.
- Vercel CLI 버전은 `@latest`로 설치. CI 안정성이 중요하면 특정 버전 고정 고려.
- 동시 push 시 `concurrency: cancel-in-progress` 설정으로 이전 배포를 취소하고 최신 커밋만 배포.
