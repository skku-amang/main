terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # S3 backend - credentials via AWS_PROFILE=homelab (.envrc)
  backend "s3" {
    bucket = "homelab-tfstate-361769566809"
    key    = "amang/vercel/terraform.tfstate"
    region = "ap-northeast-2"
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

resource "vercel_project" "web" {
  name      = "amang-web"
  framework = "nextjs"
  team_id   = var.vercel_team_id

  git_repository = {
    type = "github"
    repo = "skku-amang/main"
  }

  root_directory = "apps/web"

  install_command  = "cd ../.. && pnpm install"
  build_command    = "cd ../.. && pnpm turbo run build --filter=web"
  output_directory = ".next"

  enable_affected_projects_deployments = false

  # main 머지 시 production 빌드만 만들고 도메인은 연결하지 않음. 연결은 Kargo production 승격(promote)이 한다
  auto_assign_custom_domains = false

  # exit 0 = 빌드 건너뜀. env/*는 Kargo가 렌더링한 K8s 매니페스트 브랜치 (infra/kargo/)
  ignore_command = "case \"$VERCEL_GIT_COMMIT_REF\" in gh-pages|env/*) exit 0 ;; *) exit 1 ;; esac"

  vercel_authentication = {
    deployment_type = "none"
  }
}

resource "vercel_project_environment_variable" "api_url_production" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_API_URL"
  value      = "https://api.amang.json-server.win"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "api_url_preview" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_API_URL"
  value      = "https://api.amang.staging.json-server.win"
  target     = ["preview", "development"]
}

resource "random_bytes" "auth_secret" {
  length = 32
}

resource "vercel_project_environment_variable" "auth_secret" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "AUTH_SECRET"
  value      = random_bytes.auth_secret.base64
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_domain" "main" {
  project_id = vercel_project.web.id
  domain     = "amang.json-server.win"
}

resource "vercel_project_domain" "staging" {
  project_id = vercel_project.web.id
  domain     = "amang.staging.json-server.win"
  # 브랜치 미지정 도메인은 production 도메인으로 취급되어 promote 때 production 빌드로 함께 옮겨진다.
  # 빌드되지 않는 브랜치(env/*는 ignore_command로 제외)에 묶어 Kargo staging alias만 이 도메인을 바꾸게 한다
  git_branch = "env/staging"
}

resource "vercel_project_environment_variable" "site_url_production" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_SITE_URL"
  value      = "https://amang.json-server.win"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "site_url_preview" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_SITE_URL"
  value      = "https://amang.staging.json-server.win"
  target     = ["preview", "development"]
}

resource "vercel_project_environment_variable" "developer_emails" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_DEVELOPER_EMAILS"
  value      = var.developer_emails
  target     = ["production", "preview"]
}

resource "vercel_project_environment_variable" "sentry_dsn" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_SENTRY_DSN"
  value      = "https://fec0864f2e695dbd2d9b09dafb90cca3@o4511134421286912.ingest.us.sentry.io/4511134423515136"
  target     = ["production", "preview"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "sentry_environment" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_SENTRY_ENVIRONMENT"
  value      = "production"
  target     = ["production"]
}

# staging도 Vercel상 preview라(#625) 여기선 구분 불가 — 브라우저에서 호스트로 staging을 가려냄
# (sentry.client.config.ts). Sentry 알림은 전부 environment=production 필터라 preview·staging은 알림 없음
resource "vercel_project_environment_variable" "sentry_environment_preview" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_SENTRY_ENVIRONMENT"
  value      = "preview"
  target     = ["preview"]
}

# Web Push VAPID 공개키 (비밀 아님). private 키는 infra/k8s/api/overlays/*/sealed-secret.yaml.
# 환경별로 키 쌍이 다르므로 production/preview 값이 다르다. 교체 = 기존 구독 전부 무효화.
resource "vercel_project_environment_variable" "vapid_public_key_production" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_VAPID_PUBLIC_KEY"
  value      = "BHOyS6PFfVjOuqhMZMBp7i8YsBbSCeFlzQYw6HjdYJVgC9m-3qxOALsm51kETbJnQjabjztXX-37c5jXu_8x4hc"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "vapid_public_key_preview" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_VAPID_PUBLIC_KEY"
  value      = "BDzw2qJul-h1iGnW-AmYqGe8P3EneMjtizegthQuE0m1UFhA3ql-NWiyn9iw7ijkE-JYxQ82VE32O_PfRyniwBs"
  target     = ["preview", "development"]
}
