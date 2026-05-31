# Product Requirements Document
## Prior Auth Radar: AWS Architecture Upgrade
### Repository: `paullopez-ai/prior-auth-radar`

**Version:** 2.0  
**Status:** Ready for Build  
**Repo:** https://github.com/paullopez-ai/prior-auth-radar  
**Upgrade type:** In-place architectural evolution of existing codebase  
**Purpose:** Demonstrate production-grade AWS agentic AI architecture for Fortune 12 health insurer AI Enterprise Architect interview

---

## 1. Overview

This document defines the requirements for upgrading the existing Prior Authorization Radar application to an AWS-native architecture. The application already exists as a working Next.js dashboard at `paullopez-ai/prior-auth-radar` with a live Vercel deployment and commit history. This upgrade extends that foundation rather than replacing it.

The upgrade adds three things to the existing repo: a Python FastAPI and LangGraph backend service, a Terraform infrastructure layer, and Docker Compose for local multi-service orchestration. The frontend is largely untouched. The Vercel deployment continues to work in mock mode throughout the build since the frontend changes are additive and backward-compatible.

The core architectural change: the single Anthropic Claude API call in `lib/claude-pa-analyzer.ts` is replaced by a six-node LangGraph state machine running on Amazon Bedrock, with a pgvector RAG layer storing CMS guidelines and payer criteria. The frontend never needs to know this happened because the API response shape stays identical.

---

## 2. Problem Statement

The original application makes a single Claude API call that receives all PA data and returns a large JSON object. This works well for a demo but has critical weaknesses at enterprise scale:

- No step-level observability: if the analysis fails, you cannot tell which part failed or why
- No retrieval layer: CMS rules and payer criteria are hardcoded into the prompt, making them impossible to update without a code deployment
- No cost attribution: token spend cannot be traced to individual workflow steps
- No parallelism at the agent level: classification, compliance checking, and outcome prediction all run in a single synchronous call
- Infrastructure is Vercel-specific: no containers, no IaC, no path to enterprise deployment

The AWS upgrade solves all five. Each solution maps directly to a talking point in a senior AI architect interview at a large health insurer.

---

## 3. Goals

**Primary goal:** Upgrade the existing repo with a working AWS-native backend that runs locally via Docker Compose, with the frontend and Vercel deployment remaining functional throughout.

**Secondary goal:** Demonstrate LangGraph state machine design, Amazon Bedrock integration, RAG with pgvector, and multi-service Docker architecture within the same codebase that already shows the original build history.

**Non-goals:**
- Production HIPAA compliance (synthetic data only)
- Real Optum API integration (mock mode is the demo target)
- Full AWS deployment for the interview (local Docker Compose is sufficient; Terraform is for code review)
- Changing the Vercel deployment (it stays live in mock mode as-is)
- Rewriting any existing frontend component, type definition, or mock fixture

---

## 4. Repository Structure

The frontend stays at the repo root exactly as it exists today. The upgrade adds two new top-level directories (`backend/` and `infrastructure/`) and a Docker Compose file. Nothing moves, nothing is deleted.

```
prior-auth-radar/                    ← existing repo root, unchanged
├── app/                             ← existing Next.js app (minimal changes)
│   ├── api/
│   │   └── optum/
│   │       └── pa-status/
│   │           └── route.ts         ← MODIFIED: becomes a proxy to backend
│   ├── login/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/                      ← UNTOUCHED
├── lib/                             ← existing (optum/claude files kept, noted as superseded)
│   ├── mock/                        ← UNTOUCHED
│   ├── claude-pa-analyzer.ts        ← kept for reference, no longer called
│   ├── optum-auth.ts                ← kept for reference, no longer called
│   ├── optum-pa-status.ts           ← kept for reference, no longer called
│   └── ...all other lib files       ← UNTOUCHED
├── types/                           ← UNTOUCHED
├── public/                          ← UNTOUCHED
├── scripts/                         ← UNTOUCHED
├── backend/                         ← NEW: Python FastAPI + LangGraph service
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── analyze.py
│   │   ├── agents/
│   │   │   ├── pa_agent.py          ← LangGraph state machine definition
│   │   │   ├── nodes/
│   │   │   │   ├── fetch_node.py
│   │   │   │   ├── priority_node.py
│   │   │   │   ├── rag_node.py
│   │   │   │   ├── cms_node.py
│   │   │   │   ├── prediction_node.py
│   │   │   │   └── summary_node.py
│   │   │   └── state.py             ← LangGraph AgentState definition
│   │   ├── rag/
│   │   │   ├── embeddings.py        ← Bedrock embedding generation
│   │   │   ├── retriever.py         ← pgvector similarity search
│   │   │   └── seed/
│   │   │       ├── cms_guidelines.md
│   │   │       └── payer_criteria.md
│   │   └── config.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── infrastructure/                  ← NEW: Terraform modules
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── modules/
│   │   ├── vpc/
│   │   ├── ecs/
│   │   ├── aurora/
│   │   └── secrets/
│   └── README.md
├── Dockerfile                       ← NEW: frontend container
├── docker-compose.yml               ← NEW: local multi-service orchestration
├── middleware.ts                    ← UNTOUCHED
├── next.config.ts                   ← MODIFIED: add standalone output
├── package.json                     ← UNTOUCHED
├── tsconfig.json                    ← UNTOUCHED
├── .env.local.example               ← MODIFIED: add BACKEND_URL, remove ANTHROPIC_API_KEY
└── README.md                        ← UPDATED: document AWS architecture
```

---

## 5. Architecture

### 5.1 Service Map

```
Browser
  └── Next.js Frontend (port 3000, Docker or Vercel)
        └── POST /api/optum/pa-status
              └── Python FastAPI Backend (port 8000, Docker)
                    └── LangGraph Agent Workflow
                          ├── Amazon Bedrock (Claude 3.5 Sonnet) ← inference
                          ├── PostgreSQL / pgvector              ← RAG retrieval
                          └── LangSmith                         ← trace observability
```

### 5.2 Local Development

The full stack runs locally via `docker-compose up`. This requires Docker Desktop and AWS credentials with Bedrock access. PostgreSQL with the pgvector extension runs as a Docker container, substituting for Aurora locally. The application code sees no difference: the connection string is the only thing that changes between local and AWS environments.

The Vercel deployment remains live and functional throughout the build. Vercel serves mock mode using the original client-side data path and does not require a backend service. Mock mode on Vercel loads fixtures directly in the browser, never calls the API route, and produces no LangSmith traces. This is intentional: Vercel is the product demo, Docker/AWS is the architecture demo. In Docker Compose and AWS, the NEXT_PUBLIC_FORCE_BACKEND=true environment variable bypasses the client-side mock loader and routes every Refresh through the backend regardless of mode. The backend fetch_node handles the mock vs sandbox data source decision server-side, ensuring LangSmith traces are always generated in the containerized environment.

### 5.3 AWS Deployment

Terraform provisions the following:

- VPC with public and private subnets
- ECS Cluster (Fargate)
- Two ECS services: frontend and backend
- Application Load Balancer
- Aurora PostgreSQL Serverless v2 with pgvector
- Secrets Manager for all credentials
- IAM task roles with least-privilege Bedrock and Secrets Manager access
- ECR repositories for both Docker images

Terraform is written and reviewed for the interview but not necessarily applied live. The Docker Compose demo is the live demonstration vehicle.

---

## 6. Frontend Changes

### 6.1 What Does Not Change

All files in `components/`, `types/`, `lib/mock/`, `public/`, `scripts/`, and `middleware.ts` are untouched. The dashboard page, filter logic, sort logic, priority scoring, CMS violation display, and dark/light mode are all untouched. The existing TypeScript library files (`claude-pa-analyzer.ts`, `optum-auth.ts`, `optum-pa-status.ts`) are retained but no longer called. Add a comment to each noting they are superseded by the backend service.

### 6.2 What Changes

**`app/api/optum/pa-status/route.ts`**

Replace the existing orchestration logic with a thin proxy to the Python backend. The request and response shapes stay identical so all frontend state management requires zero changes.

```typescript
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000';

  const response = await fetch(`${backendUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data);
}
```

**Mock mode behavior differs between Vercel and Docker:**

On Vercel, mock mode loads data entirely client-side via `loadMockFeedData()` and never calls this route at all. The route is only invoked on Refresh in sandbox mode. This means Vercel mock mode produces no LangSmith traces, which is expected and fine. The Vercel deployment is the product demo.

In Docker Compose and AWS, the frontend should call the backend on every Refresh regardless of mock vs sandbox mode. This ensures LangSmith traces are always generated in the containerized environment, which is the architecture demo. To enforce this, set `NEXT_PUBLIC_FORCE_BACKEND=true` in the Docker and AWS environment, and update `app/page.tsx` to skip `loadMockFeedData()` and always call the API route when that flag is set. The backend's `fetch_node` reads `APP_ENV` from its own environment and handles the data source decision server-side. The frontend just forwards the current mode in the request body as before.

This gives you two distinct demo modes from the same codebase: Vercel shows the product, Docker/AWS shows the architecture.

**`next.config.ts`**

Add `output: 'standalone'` to enable Docker standalone build:

```typescript
const nextConfig = {
  output: 'standalone',
  // ...existing config
};
```

**`.env.local.example`**

Add `BACKEND_URL`. Remove `ANTHROPIC_API_KEY` since Claude is no longer called from the frontend:

```
# Backend service (Docker Compose or AWS ALB)
BACKEND_URL=http://localhost:8000

# Remove or comment out:
# ANTHROPIC_API_KEY= (moved to backend)
```

**`Dockerfile` (new, at repo root)**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 7. Backend Service: Python FastAPI and LangGraph

### 7.1 Purpose

The backend receives PA data from the frontend, runs a six-node LangGraph workflow using Amazon Bedrock and pgvector, and returns the same `PAFeedResult` JSON shape the frontend already knows how to render. The response contract is the single most important constraint: it cannot change without breaking the frontend.

### 7.2 API Contract

**Endpoint:** `POST /api/analyze`

**Request body:**
```json
{
  "mode": "mock",
  "pa_items": [ ...SyntheticPA objects from lib/pa-items.ts... ]
}
```

**Response body:** Identical to the existing `PAFeedResult` TypeScript type. No frontend changes required.

**Health check:** `GET /health` returns `{ "status": "ok", "service": "pa-agent" }`

### 7.3 LangGraph State Machine

#### AgentState

```python
class PAAgentState(TypedDict):
    pa_items: List[dict]       # input PA records
    optum_results: List[dict]  # raw PA status data (mock or live)
    priorities: List[dict]     # priority classification per PA
    rag_context: List[dict]    # retrieved CMS and payer criteria per PA
    cms_flags: List[dict]      # compliance violation flags per PA
    predictions: List[dict]    # outcome predictions for pending PAs
    summary: dict              # macro practice-wide summary
    timing: dict               # wall-clock ms per node
    errors: List[str]          # non-fatal errors accumulated across nodes
```

#### Graph Definition

```python
workflow = StateGraph(PAAgentState)

workflow.add_node("fetch",      fetch_node)
workflow.add_node("priority",   priority_node)
workflow.add_node("rag",        rag_node)
workflow.add_node("cms",        cms_node)
workflow.add_node("prediction", prediction_node)
workflow.add_node("summary",    summary_node)

workflow.set_entry_point("fetch")
workflow.add_edge("fetch",      "priority")
workflow.add_edge("priority",   "rag")
workflow.add_edge("rag",        "cms")
workflow.add_edge("cms",        "prediction")
workflow.add_edge("prediction", "summary")
workflow.add_edge("summary",    END)

agent = workflow.compile()
```

#### Node Definitions

**fetch_node**
Loads PA data. In mock mode: returns data equivalent to the TypeScript mock fixtures in `lib/mock/pa-status-fixtures.ts`, ported to Python dicts. In sandbox mode: calls Optum Real API using OAuth client-credentials, same logic as the original `optum-auth.ts` and `optum-pa-status.ts` ported to Python. Individual PA failures are isolated and added to `errors`; the workflow does not abort.

**priority_node**
Calls Bedrock (Claude 3.5 Sonnet) with a focused classification prompt. Input: PA items with procedure dates, submission dates, and current PA status. Output: priority classification (CRITICAL / URGENT / ACTION_REQUIRED / MONITOR / APPROVED) per PA, matching the exact criteria from the original system prompt. This is a smaller, cheaper call than the original single large call. LangSmith tag: `priority_classification`.

**rag_node**
For each PA, constructs a query from procedure code, diagnosis, and payer name. Generates a query embedding using Bedrock Titan Embeddings. Runs cosine similarity search against the pgvector store. Returns the top-3 relevant policy chunks per PA. These chunks are carried forward in state and injected into the prediction node prompt. LangSmith tag: `rag_retrieval`.

**cms_node**
Pure logic node with no LLM call. Calculates CMS compliance violations by comparing PA submission date against mandatory response windows (7 calendar days for standard, 72 hours for urgent). Enriches each PA record with `is_cms_violated` flag and days overdue. This matches the existing CMS logic in `lib/pa-utils.ts` ported to Python. LangSmith tag: `cms_compliance`.

**prediction_node**
Calls Bedrock for pending PAs only. Prompt includes the retrieved RAG context from `rag_context` for each PA. Generates approval likelihood (HIGH / MEDIUM / LOW), likely denial reason, best approach to secure approval, and peer-to-peer review recommendation. This node demonstrates RAG working: the model reasons over retrieved CMS guidelines and payer criteria, not hardcoded prompt rules. LangSmith tag: `outcome_prediction`.

**summary_node**
Final Bedrock call. Receives the complete assembled state: priorities, cms_flags, and predictions. Generates the macro practice-wide summary matching the `ClaudePASummary` type: top-3 actions, CMS compliance summary, flagged PAs with specific issues, and a non-obvious cross-PA insight. LangSmith tag: `macro_summary`.

### 7.4 RAG Layer

**Vector store:** pgvector on PostgreSQL (local Docker) / Aurora PostgreSQL (AWS)

**Embedding model:** Amazon Bedrock Titan Embeddings G1 (`amazon.titan-embed-text-v1`)

**Seed documents:**

`cms_guidelines.md`: CMS Prior Authorization Final Rule response time windows, denial documentation requirements, appeal rights language, and January 2026 effective dates. Approximately 800 words, chunked into 200-token segments with 20-token overlap.

`payer_criteria.md`: Synthetic payer-specific prior authorization criteria for common procedure codes (MRI, CT, orthopedic surgery, cardiac catheterization, chemotherapy). Includes typical documentation requirements, common denial reasons by payer type, and peer-to-peer review success patterns. Approximately 1,200 words, same chunking strategy.

**Seed process:** A `seed.py` script runs on backend container startup if the vector table is empty. It chunks the seed documents, generates embeddings via Bedrock, and inserts them into pgvector. Idempotent: checks row count before inserting.

**LangChain integration:** `PGVector` from `langchain-postgres`, cosine similarity, top-3 results per query.

### 7.5 Amazon Bedrock Configuration

**Inference model:** `anthropic.claude-3-5-sonnet-20241022-v2:0`

**Embedding model:** `amazon.titan-embed-text-v1`

**Region:** `us-east-1`

**Local authentication:** AWS credentials via environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`).

**ECS authentication:** IAM task role with `bedrock:InvokeModel` permission. No static credentials in the container.

**LangChain classes:** `ChatBedrockConverse` for inference nodes, `BedrockEmbeddings` for the RAG layer. Both from `langchain-aws`.

### 7.6 LangSmith Observability

LangSmith traces every LangGraph execution automatically when `LANGCHAIN_TRACING_V2=true`. Each node appears as a named span with input state, output state, token count, latency, and estimated cost. The LangSmith dashboard is the demo centerpiece during the interview: it makes every agent decision visible without any additional instrumentation code.

**Required environment variables:**
```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=<from smith.langchain.com>
LANGCHAIN_PROJECT=prior-auth-radar-aws
```

---

## 8. Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: pa_agent
      POSTGRES_USER: pa_user
      POSTGRES_PASSWORD: pa_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pa_user -d pa_agent"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://pa_user:pa_password@postgres:5432/pa_agent
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_DEFAULT_REGION=us-east-1
      - LANGCHAIN_TRACING_V2=true
      - LANGCHAIN_API_KEY=${LANGCHAIN_API_KEY}
      - LANGCHAIN_PROJECT=prior-auth-radar-aws
      - APP_ENV=${APP_ENV:-mock}
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_APP_ENV=${APP_ENV:-mock}
      - NEXT_PUBLIC_FORCE_BACKEND=true
      - BACKEND_URL=http://backend:8000
      - AUTH_USERNAME=${AUTH_USERNAME}
      - AUTH_PASSWORD_HASH=${AUTH_PASSWORD_HASH}
      - AUTH_SECRET=${AUTH_SECRET}
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## 9. Environment Variables

### Root `.env.local` additions

```
# AWS backend service
BACKEND_URL=http://localhost:8000

# Forces all Refresh calls through the backend (Docker/AWS only; leave unset on Vercel)
NEXT_PUBLIC_FORCE_BACKEND=true

# Removed (moved to backend):
# ANTHROPIC_API_KEY
```

### `backend/.env.example`

```
APP_ENV=mock

DATABASE_URL=postgresql://pa_user:pa_password@localhost:5432/pa_agent

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1

BEDROCK_INFERENCE_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1

LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=prior-auth-radar-aws

# Sandbox mode only
OPTUM_CLIENT_ID=
OPTUM_CLIENT_SECRET=
OPTUM_AUTH_URL=
OPTUM_GRAPHQL_URL=
OPTUM_PROVIDER_TAX_ID=
```

---

## 10. Python Backend Dependencies

```
# backend/requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
langchain==0.3.0
langchain-aws==0.2.0
langchain-community==0.3.0
langgraph==0.2.0
langchain-postgres==0.0.9
psycopg2-binary==2.9.9
boto3==1.35.0
pydantic==2.9.0
python-dotenv==1.0.1
```

---

## 11. Terraform Infrastructure

### 11.1 Module Structure

**`modules/vpc`**
VPC (`10.0.0.0/16`), two public subnets (ALB), two private subnets (ECS and Aurora), internet gateway, NAT gateway, route tables. Security groups: ALB inbound 80/443, frontend ECS inbound from ALB, backend ECS inbound from frontend ECS, Aurora inbound from backend ECS on port 5432.

**`modules/ecs`**
ECS Cluster (Fargate), two task definitions (`pa-frontend` and `pa-backend`), two services at desired count 1, Application Load Balancer with listener rules (all traffic to frontend, `/api/analyze*` to backend), CloudWatch log groups, ECR repositories, IAM task execution role (ECR pull, CloudWatch), IAM task role (`bedrock:InvokeModel`, `secretsmanager:GetSecretValue`).

**`modules/aurora`**
Aurora PostgreSQL Serverless v2, minimum 0.5 ACU / maximum 2 ACU, pgvector extension via parameter group, private subnet group, credentials in Secrets Manager.

**`modules/secrets`**
Secrets Manager secrets for Aurora credentials, LangSmith API key, and Optum API credentials. Outputs ARNs for ECS task definition injection.

### 11.2 Variables

```hcl
variable "aws_region"      { default = "us-east-1" }
variable "project_name"    { default = "prior-auth-radar" }
variable "environment"     { default = "demo" }
variable "frontend_image"  { description = "ECR image URI for frontend" }
variable "backend_image"   { description = "ECR image URI for backend" }
```

### 11.3 Key Outputs

```hcl
output "alb_dns_name"      { value = module.ecs.alb_dns_name }
output "aurora_endpoint"   { value = module.aurora.cluster_endpoint }
output "frontend_ecr_url"  { value = module.ecs.frontend_ecr_url }
output "backend_ecr_url"   { value = module.ecs.backend_ecr_url }
```

---

## 12. README Update

The README is both a technical document and an interview artifact. Update it to cover:

**Architecture Overview:** A diagram showing the original single-call architecture versus the new six-node LangGraph state machine. ASCII or Mermaid. Makes the upgrade rationale immediately visible to anyone who reads the repo.

**AWS Stack Decisions:** A table listing each AWS service, what it replaces from v1, and why it was chosen over the obvious alternative (Bedrock over direct Anthropic, pgvector over OpenSearch, ECS/Fargate over Lambda, Aurora Serverless over standard RDS).

**What This Demonstrates:** An honest section listing the specific architectural patterns the upgrade showcases: LangGraph state machine design, RAG with pgvector, multi-service Docker architecture, Terraform IaC, and LangSmith observability. Signals that the architecture was intentional.

**Local Setup:** From `git clone` to `docker-compose up` in under 10 steps. Must work on a clean Mac with Docker Desktop and valid AWS credentials.

**Terraform Deployment:** High-level AWS deployment steps. Does not need to be a complete walkthrough.

**Technology Stack table:** Update the existing table to add the AWS layer:

| Layer | v1 (Original) | v2 (AWS Upgrade) |
|---|---|---|
| AI Inference | Anthropic Claude (direct) | Amazon Bedrock (Claude 3.5 Sonnet) |
| Agent Orchestration | Single prompt call | LangGraph state machine (6 nodes) |
| RAG / Vector Store | None | pgvector on PostgreSQL / Aurora |
| Observability | Sandbox Dev Console | LangSmith trace dashboard |
| Infrastructure | Vercel serverless | Docker Compose / ECS Fargate |
| IaC | None | Terraform |

---

## 13. Build Sequence

Build in this order to keep the Vercel deployment live and the demo runnable at every step.

1. Add `output: 'standalone'` to `next.config.ts`. Verify `bun run build` still succeeds.
2. Add `Dockerfile` at repo root. Verify `docker build` succeeds.
3. Scaffold `backend/`: FastAPI app, `GET /health`, `POST /api/analyze` stub that returns hardcoded mock `PAFeedResult` JSON, `Dockerfile`, `requirements.txt`.
4. Add `docker-compose.yml`. Verify all three containers start with `docker-compose up`.
5. Update `app/api/optum/pa-status/route.ts` to proxy to backend. Verify end-to-end: browser at `localhost:3000` loads the dashboard using the stub backend response.
6. Implement `cms_node` (pure logic, no Bedrock dependency). Update stub to call it.
7. Add pgvector seed documents and `seed.py`. Verify seed runs on container start and rows appear in the database.
8. Implement `rag_node`: embedding generation via Bedrock, pgvector similarity search. Verify retrieval works with a test query before wiring into the graph.
9. Implement LangGraph `AgentState` and full graph definition with all six nodes wired. Start with nodes calling Bedrock; `cms_node` is already pure logic.
10. Implement `priority_node` with Bedrock call.
11. Implement `prediction_node` with Bedrock call and RAG context injection from state.
12. Implement `summary_node` with Bedrock call.
13. Implement `fetch_node` mock mode: port the TypeScript mock fixtures to Python dicts matching the same PA scenarios.
14. Enable LangSmith. Run full workflow. Verify six-node trace appears in LangSmith dashboard.
15. Write Terraform modules. Run `terraform validate` and `terraform plan` (plan only, no apply required).
16. Update README with architecture diagram, stack comparison table, and setup instructions.
17. Final end-to-end test: fresh `docker-compose up`, browser at `localhost:3000`, full dashboard loads in mock mode, LangSmith trace shows all six nodes.
18. Commit with a meaningful message such as "Add AWS backend: LangGraph agent, Bedrock, pgvector, Terraform". Push to `paullopez-ai/prior-auth-radar`.

---

## 14. Demo Script

The intended interview walkthrough follows this sequence:

1. `docker-compose up` from terminal. Containers start in under 60 seconds.
2. Open browser to `localhost:3000`. Dashboard loads in mock mode.
3. Point to the priority scoring, CMS violation badges, and macro summary panel. "Same frontend as before, completely unchanged."
4. Open LangSmith dashboard. Show the trace from the most recent run: six nodes, latency per node, tokens per call, RAG retrieval results visible in the `rag_node` span.
5. Click into the `rag_node` trace. Show the query sent, the pgvector results returned, and how that context was passed as state to `prediction_node`.
6. Open `backend/agents/pa_agent.py`. Walk through the LangGraph graph definition. Explain why each node is separated and what failure isolation looks like when one node errors.
7. Open `infrastructure/main.tf`. Show the Terraform module structure. Walk through the ECS, Aurora, and Secrets Manager resources.
8. Field questions.

The LangSmith trace is the centerpiece. It makes the agentic architecture visible without hand-waving and eliminates the "how do you know it's actually doing what you say" question before it gets asked.

---

## 15. Acceptance Criteria

- [ ] `docker-compose up` starts all three containers without errors on a clean environment
- [ ] Frontend loads at `localhost:3000` in mock mode with no API keys beyond AWS credentials
- [ ] Dashboard renders priority scores, CMS flags, per-PA actions, and macro summary correctly
- [ ] LangSmith shows a complete six-node trace for each dashboard load or manual refresh
- [ ] The `rag_node` trace shows pgvector results contextually relevant to the PA being analyzed
- [ ] `backend/agents/pa_agent.py` defines a complete LangGraph `StateGraph` with all six nodes and edges
- [ ] Terraform modules pass `terraform validate` cleanly
- [ ] README includes the v1 vs v2 architecture comparison table and local setup instructions
- [ ] No Anthropic API keys are used anywhere (all inference through Bedrock)
- [ ] All files in `components/` and `types/` are byte-for-byte identical to the original
- [ ] Vercel deployment continues to work in mock mode throughout the build
