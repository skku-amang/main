variable "vercel_api_token" {
  description = "Vercel API token for authentication"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID (slug or ID)"
  type        = string
}

variable "auth_secret" {
  description = "NextAuth secret for JWT signing"
  type        = string
  sensitive   = true
}
