output "db_password" {
  value     = random_password.db.result
  sensitive = true
}

output "aurora_secret_arn" {
  value = aws_secretsmanager_secret.aurora.arn
}

output "langsmith_secret_arn" {
  value = aws_secretsmanager_secret.langsmith.arn
}

output "optum_secret_arn" {
  value = aws_secretsmanager_secret.optum.arn
}
