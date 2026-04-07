variable "vercel_api_token" {
  description = "Vercel API token for authentication"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID (slug or ID)"
  type        = string
}

variable "developer_emails" {
  description = "Comma-separated developer emails to exclude from Vercel Analytics"
  type        = string
  default     = ""
}
