variable "sentry_auth_token" {
  description = "Sentry auth token (alerts:write, org:read 스코프 필요)"
  type        = string
  sensitive   = true
}
