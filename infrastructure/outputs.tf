output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = module.ecs.alb_dns_name
}

output "aurora_endpoint" {
  description = "Aurora PostgreSQL writer endpoint"
  value       = module.aurora.cluster_endpoint
}

output "frontend_ecr_url" {
  description = "ECR repository URL for the frontend image"
  value       = module.ecs.frontend_ecr_url
}

output "backend_ecr_url" {
  description = "ECR repository URL for the backend image"
  value       = module.ecs.backend_ecr_url
}
