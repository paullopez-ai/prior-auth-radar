resource "aws_db_subnet_group" "this" {
  name       = "${var.name_prefix}-aurora-subnets"
  subnet_ids = var.subnet_ids
  tags       = { Name = "${var.name_prefix}-aurora-subnets" }
}

# pgvector ships with Aurora PostgreSQL 15.3+; it is enabled per-database with
# `CREATE EXTENSION vector`. langchain-postgres / the seed step runs that on
# first connect. This parameter group is the hook for any cluster-level tuning.
resource "aws_rds_cluster_parameter_group" "this" {
  name        = "${var.name_prefix}-aurora-pg"
  family      = "aurora-postgresql15"
  description = "Aurora PostgreSQL cluster params (pgvector enabled via CREATE EXTENSION)"
}

resource "aws_rds_cluster" "this" {
  cluster_identifier              = "${var.name_prefix}-aurora"
  engine                          = "aurora-postgresql"
  engine_mode                     = "provisioned"
  engine_version                  = "15.4"
  database_name                   = var.db_name
  master_username                 = var.master_username
  master_password                 = var.master_password
  db_subnet_group_name            = aws_db_subnet_group.this.name
  vpc_security_group_ids          = [var.aurora_sg_id]
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.this.name
  skip_final_snapshot             = true

  serverlessv2_scaling_configuration {
    min_capacity = var.min_capacity
    max_capacity = var.max_capacity
  }
}

resource "aws_rds_cluster_instance" "this" {
  identifier         = "${var.name_prefix}-aurora-1"
  cluster_identifier = aws_rds_cluster.this.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.this.engine
  engine_version     = aws_rds_cluster.this.engine_version
}
