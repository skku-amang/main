output "project_id" {
  description = "Vercel project ID"
  value       = vercel_project.web.id
}

output "domains" {
  description = "Project domains"
  value       = [vercel_project_domain.main.domain]
}
