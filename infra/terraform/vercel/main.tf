terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
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
}

resource "vercel_project_environment_variable" "api_url_production" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_API_URL"
  value      = "https://amang-api.json-server.win"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "api_url_preview" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "NEXT_PUBLIC_API_URL"
  value      = "https://amang-api-staging.json-server.win"
  target     = ["preview", "development"]
}

resource "vercel_project_environment_variable" "auth_secret" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  key        = "AUTH_SECRET"
  value      = var.auth_secret
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_domain" "main" {
  project_id = vercel_project.web.id
  domain     = "amang.json-server.win"
}
