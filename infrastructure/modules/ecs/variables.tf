variable "name_prefix" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "alb_sg_id" {
  type = string
}

variable "frontend_sg_id" {
  type = string
}

variable "backend_sg_id" {
  type = string
}

variable "frontend_image" {
  type = string
}

variable "backend_image" {
  type = string
}

variable "app_env" {
  type    = string
  default = "mock"
}

variable "bedrock_inference_model" {
  type = string
}

variable "bedrock_embedding_model" {
  type = string
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "langsmith_secret_arn" {
  type = string
}

variable "aurora_secret_arn" {
  type = string
}
