resource "sentry_team_member" "manamana32321" {
  organization = local.organization
  team         = sentry_team.amang.slug
  member_id    = "14695017"
}
