variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used as a resource name prefix"
  type        = string
  default     = "prior-auth-radar"
}

variable "environment" {
  description = "Deployment environment label"
  type        = string
  default     = "demo"
}

variable "frontend_image" {
  description = "ECR image URI for the Next.js frontend"
  type        = string
}

variable "backend_image" {
  description = "ECR image URI for the FastAPI + LangGraph backend"
  type        = string
}

variable "db_name" {
  description = "Aurora PostgreSQL database name"
  type        = string
  default     = "pa_agent"
}

variable "db_username" {
  description = "Aurora master username"
  type        = string
  default     = "pa_user"
}

variable "bedrock_inference_model" {
  description = "Bedrock model id for inference nodes"
  type        = string
  default     = "anthropic.claude-3-5-sonnet-20241022-v2:0"
}

variable "bedrock_embedding_model" {
  description = "Bedrock model id for embeddings"
  type        = string
  default     = "amazon.titan-embed-text-v1"
}

variable "langsmith_api_key" {
  description = "LangSmith API key (stored in Secrets Manager)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "app_env" {
  description = "Backend data source mode: mock or sandbox"
  type        = string
  default     = "mock"
}
