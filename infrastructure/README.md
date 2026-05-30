# Prior Auth Radar — AWS Infrastructure (Terraform)

Terraform definitions for the AWS-native deployment of Prior Auth Radar. This is
written and reviewed as an interview artifact; the live demo runs via Docker
Compose. `terraform plan` should produce a clean plan; a full `apply` is optional.

## What it provisions

| Module     | Resources |
|------------|-----------|
| `vpc`      | VPC (`10.0.0.0/16`), 2 public + 2 private subnets, IGW, NAT gateway, route tables, and four security groups (ALB → frontend → backend → Aurora). |
| `secrets`  | Secrets Manager secrets for Aurora credentials (random password), the LangSmith API key, and Optum credentials. |
| `aurora`   | Aurora PostgreSQL Serverless v2 (0.5–2 ACU) with a cluster parameter group; pgvector is enabled per-database via `CREATE EXTENSION vector`. |
| `ecs`      | ECS Fargate cluster, two task definitions (`frontend`, `backend`) and services, an Application Load Balancer (default → frontend, `/api/analyze*` and `/health` → backend), CloudWatch log groups, two ECR repositories, and least-privilege IAM task roles (`bedrock:InvokeModel`, `secretsmanager:GetSecretValue`). |

## Architecture

```
Internet ─► ALB (public subnets)
              ├── default            ─► Frontend service (Fargate, private)
              └── /api/analyze*, /health ─► Backend service (Fargate, private)
                                              └── Aurora PostgreSQL + pgvector (private)
                                              └── Amazon Bedrock (via IAM task role)
```

## Usage

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars   # then edit
terraform init
terraform validate
terraform plan
# terraform apply        # optional — provisions live AWS resources
```

### Image bootstrap note

The ECS module creates the ECR repositories that the task definitions pull from.
On a clean account the typical order is:

1. `terraform apply -target=module.ecs.aws_ecr_repository.frontend -target=module.ecs.aws_ecr_repository.backend`
2. Build and push both images to those repos.
3. Set `frontend_image` / `backend_image` to the pushed tags and run a full `terraform apply`.

## Key outputs

- `alb_dns_name` — public entry point for the app.
- `aurora_endpoint` — Aurora writer endpoint.
- `frontend_ecr_url` / `backend_ecr_url` — push targets for the Docker images.

## Authentication

ECS tasks authenticate to Bedrock through the IAM task role — no static AWS
credentials live in the containers. Aurora and LangSmith credentials are injected
from Secrets Manager at task launch.
