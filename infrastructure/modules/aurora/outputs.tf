output "cluster_endpoint" {
  value = aws_rds_cluster.this.endpoint
}

output "cluster_port" {
  value = aws_rds_cluster.this.port
}

output "database_name" {
  value = aws_rds_cluster.this.database_name
}
