resource "random_password" "db" {
  length  = 24
  special = false
}

# Aurora master credentials.
resource "aws_secretsmanager_secret" "aurora" {
  name        = "${var.name_prefix}/aurora-credentials"
  description = "Aurora PostgreSQL master credentials"
}

resource "aws_secretsmanager_secret_version" "aurora" {
  secret_id = aws_secretsmanager_secret.aurora.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db.result
  })
}

# LangSmith API key.
resource "aws_secretsmanager_secret" "langsmith" {
  name        = "${var.name_prefix}/langsmith-api-key"
  description = "LangSmith API key for trace observability"
}

resource "aws_secretsmanager_secret_version" "langsmith" {
  secret_id     = aws_secretsmanager_secret.langsmith.id
  secret_string = var.langsmith_api_key
}

# Optum sandbox credentials (populated out-of-band; placeholder created here).
resource "aws_secretsmanager_secret" "optum" {
  name        = "${var.name_prefix}/optum-credentials"
  description = "Optum sandbox API credentials"
}
