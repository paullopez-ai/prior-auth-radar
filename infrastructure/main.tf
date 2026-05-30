locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

module "vpc" {
  source       = "./modules/vpc"
  name_prefix  = local.name_prefix
  vpc_cidr     = "10.0.0.0/16"
  azs          = ["${var.aws_region}a", "${var.aws_region}b"]
}

module "secrets" {
  source            = "./modules/secrets"
  name_prefix       = local.name_prefix
  db_username       = var.db_username
  langsmith_api_key = var.langsmith_api_key
}

module "aurora" {
  source          = "./modules/aurora"
  name_prefix     = local.name_prefix
  subnet_ids      = module.vpc.private_subnet_ids
  aurora_sg_id    = module.vpc.aurora_sg_id
  db_name         = var.db_name
  master_username = var.db_username
  master_password = module.secrets.db_password
}

module "ecs" {
  source                  = "./modules/ecs"
  name_prefix             = local.name_prefix
  aws_region              = var.aws_region
  vpc_id                  = module.vpc.vpc_id
  public_subnet_ids       = module.vpc.public_subnet_ids
  private_subnet_ids      = module.vpc.private_subnet_ids
  alb_sg_id               = module.vpc.alb_sg_id
  frontend_sg_id          = module.vpc.frontend_sg_id
  backend_sg_id           = module.vpc.backend_sg_id
  frontend_image          = var.frontend_image
  backend_image           = var.backend_image
  app_env                 = var.app_env
  bedrock_inference_model = var.bedrock_inference_model
  bedrock_embedding_model = var.bedrock_embedding_model

  database_url = format(
    "postgresql://%s:%s@%s:%d/%s",
    var.db_username,
    module.secrets.db_password,
    module.aurora.cluster_endpoint,
    module.aurora.cluster_port,
    var.db_name,
  )

  langsmith_secret_arn = module.secrets.langsmith_secret_arn
  aurora_secret_arn    = module.secrets.aurora_secret_arn
}
