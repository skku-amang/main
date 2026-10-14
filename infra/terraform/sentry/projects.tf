resource "sentry_team" "amang" {
  organization = local.organization
  name         = "Amang"
  slug         = "amang"
}

resource "sentry_project" "web" {
  organization = local.organization
  name         = "web"
  slug         = "web"
  platform     = "javascript-nextjs"
  teams        = [sentry_team.amang.slug]

  highlight_tags = ["handled", "level", "transaction", "url"]
}

resource "sentry_project" "api" {
  organization = local.organization
  name         = "api"
  slug         = "api"
  platform     = "node-nestjs"
  teams        = [sentry_team.amang.slug]

  highlight_tags = ["handled", "level", "transaction", "url"]
}
