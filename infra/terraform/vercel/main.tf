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

  ignore_command = "[ \"$VERCEL_GIT_COMMIT_REF\" = \"gh-pages\" ]"

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
