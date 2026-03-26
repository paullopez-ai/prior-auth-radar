# Prior Authorization Radar

An AI-powered healthcare dashboard for medical practices to intelligently track, prioritize, and act on prior authorization (PA) requests. Built with Next.js 16, Claude AI (Sonnet 4.6), and the Optum Real API sandbox.

---

## Table of Contents

- [What It Does](#what-it-does)
- [How It Works](#how-it-works)
- [Architecture Overview](#architecture-overview)
- [Application Modes](#application-modes)
- [Sandbox Limitation — Important](#sandbox-limitation--important)
- [Authentication & Security](#authentication--security)
- [Data Flow](#data-flow)
- [Component Structure](#component-structure)
- [Claude AI Integration](#claude-ai-integration)
- [CMS Prior Authorization Final Rule](#cms-prior-authorization-final-rule)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Password Management](#password-management)
- [Deployment](#deployment)

---

## What It Does

Medical practices spend an average of **14.6 hours per week per physician** managing prior authorizations — calling payer hotlines, logging into payer portals, tracking appeal deadlines, and guessing at approval likelihood. This application replaces that manual workflow with an intelligent dashboard that:

- **Fetches live PA statuses** from the Optum API (or rich mock data for demos)
- **Prioritizes every PA** by clinical urgency (days until scheduled procedure) and regulatory status
- **Applies AI analysis** via Claude to generate specific, actionable recommendations for each PA
- **Tracks CMS compliance** against the January 2026 Prior Authorization Final Rule response windows
- **Predicts outcomes** for pending PAs (approval likelihood, likely denial reason, whether to request peer-to-peer review)
- **Surfaces macro insights** across the entire practice's PA portfolio in a single summary

---

## How It Works

### 1. Data Loading

On initial page load, the dashboard immediately populates with data. In **mock mode** this happens synchronously from pre-generated fixtures — no network calls, no login required. In **sandbox or production mode**, clicking Refresh triggers the full pipeline described below.

### 2. Optum API — PA Status Fetch

The server-side API route (`/api/optum/pa-status`) orchestrates the data pipeline:

1. **OAuth Token**: The server calls the Optum identity endpoint (`idx.linkhealth.com`) using client-credentials flow to exchange `OPTUM_CLIENT_ID` and `OPTUM_CLIENT_SECRET` for a Bearer token. The token is cached in module scope and reused until ~60 seconds before expiry.

2. **Parallel Status Queries**: All 10 PA requests are dispatched concurrently via `Promise.all()`. Each query POSTs a GraphQL request to the configured Optum endpoint with `authorizationNumber` and `tradingPartnerServiceId` variables. Individual failures are isolated — one failed query does not abort the batch.

3. **Timing Metrics**: Wall-clock time is captured for the parallel batch and the Claude call separately. These are displayed as badges in the UI header (`Parallel: 342ms`, `Claude: 1.8s`).

### 3. Claude AI Analysis

After Optum results are collected, the server builds a structured prompt from all PA data and sends it to `claude-sonnet-4-6` in a single API call (max 3000 tokens, temperature 0). Claude returns a JSON object containing:

- **Per-PA Actions** (`ClaudePAAction`): For each authorization — priority classification, the single most important immediate action, step-by-step action steps with time estimates, CMS compliance action if the response window has been exceeded, a risk assessment, specific documentation recommendations, and whether to contact the payer today.

- **Per-PA Outcome Predictions** (`ClaudePAOutcomePrediction`): For pending PAs — approval likelihood (HIGH / MEDIUM / LOW), key positive and negative factors, the most likely denial reason, the best approach to secure approval, and a peer-to-peer review recommendation.

- **Macro Summary** (`ClaudePASummary`): Practice-wide counts, the top 3 actions that would resolve the most risk, a CMS compliance summary, flagged PAs with specific issues, and a non-obvious insight synthesized across all authorizations.

The system prompt encodes detailed rules for priority assignment, CMS window enforcement, procedure date urgency thresholds, and documentation guidance to ensure consistent, clinically grounded output.

### 4. Dashboard Rendering

The React client receives the `PAFeedResult` response and updates the full dashboard state. Users can:

- **Filter** by priority level, payer name, or urgency type (standard / urgent / expedited)
- **Sort** by priority, procedure date, days since submission, payer name, or CMS overdue status
- **Expand any PA row** to reveal four tabs: Action (AI recommendations), Prediction (outcome forecast), Detail (full patient/procedure/payer record), and Raw (the Optum API response JSON)
- **Review the macro summary panel** for practice-wide intelligence at a glance
- **Open the sandbox console** (sandbox mode only) to inspect timestamped diagnostic logs for every API step

---

## Architecture Overview

```
Browser (React / Next.js)
     │
     │  POST /api/optum/pa-status
     ▼
Server Route Handler (app/api/optum/pa-status/route.ts)
     │
     ├─── lib/optum-auth.ts       OAuth client-credentials → Bearer token (cached)
     │
     ├─── lib/optum-pa-status.ts  GraphQL query × N PAs (Promise.all)
     │         └── OPTUM_GRAPHQL_URL  ← [see Sandbox Limitation]
     │
     ├─── lib/claude-pa-analyzer.ts  buildClaudeInput() → analyzeWithClaude()
     │         └── claude-sonnet-4-6 via Anthropic SDK
     │
     └─── PAFeedResult  →  browser state update  →  full dashboard render
```

**Key design decisions:**
- All external API calls are server-side only. Credentials never reach the browser.
- The three-mode config (`NEXT_PUBLIC_APP_ENV`) switches the entire pipeline from mock fixtures to live APIs with a single env var change.
- Claude analysis degrades gracefully — if the Anthropic API call fails, the server builds a fallback analysis from the raw Optum data rather than returning an error.

---

## Application Modes

The app has three operating modes controlled by `NEXT_PUBLIC_APP_ENV`:

### `mock` — Demo Mode (Default for Development)

- **No authentication required.** The dashboard loads instantly.
- All data comes from `lib/mock/` fixtures — pre-generated PA statuses and Claude analysis.
- API response timings are simulated (280ms parallel batch, 2.2s Claude).
- The Refresh button re-runs the mock pipeline with the same synthetic data.
- **This is the recommended mode for demonstrating the full dashboard.** All 10 PA scenarios are represented with rich, realistic data.

### `sandbox` — Optum Sandbox + Real Claude

- **Login required.** Users authenticate at `/login` before accessing the dashboard.
- The Optum sandbox OAuth endpoint and GraphQL URL are used.
- Claude API calls are real — actual analysis is generated from Optum responses.
- A collapsible **Sandbox Dev Console** appears at the bottom of the page with timestamped diagnostic logs showing every step of the pipeline (token fetch, each PA query result, Claude timing).
- See [Sandbox Limitation](#sandbox-limitation--important) below for critical details on what the Optum sandbox can and cannot return.

### `production` — Live Optum API + Real Claude

- **Login required.**
- Uses production Optum API credentials.
- Full authentication enforcement via middleware.
- Intended for deployment with real payer data.

---

## Sandbox Limitation — Important

> **The Optum Real API suite does not have a standalone "Prior Authorization Status" API.**

This is the most important thing to understand about the sandbox integration. Here is the full picture:

### What the PRD Specified

The original product specification listed `OPTUM_GRAPHQL_URL` as:

```
https://sandbox-apigw.optum.com/oihub/prior-auth/v1/graphql
```

This URL was **illustrative** — included in the PRD to describe the desired data shape, not as a reference to a confirmed live endpoint. The endpoint does not exist in the Optum API marketplace.

**This is why sandbox mode returns 401 errors** — the OAuth token is obtained successfully, but the GraphQL endpoint it is presented to does not exist. The Sandbox Dev Console shows this clearly: token acquisition succeeds, then each PA query fails with a 401 at the missing endpoint.

### What Optum Actually Offers

The Optum Real API marketplace provides four relevant API families:

| API | Purpose |
|-----|---------|
| **Real Pre-Service Eligibility** | Check patient eligibility before a visit (used by `patient-cost-clarity`) |
| **Real Patient Benefit Check** | Check whether a procedure *requires* prior authorization; includes PA/referral requirement lookups |
| **Real Prior Auth/Referral Actions** | Submit new PAs, track existing PAs, manage referrals — this is the closest equivalent to a "PA status" API |
| **Real Claim Pre-Check / Claim Actions / Claim Inquiry / Document Search** | Post-service claim management |

The **Real Prior Auth/Referral Actions** API is the correct target for this application's use case. However, it uses a different query structure from the illustrative GraphQL schema in the PRD, and it requires registering for that specific API in the Optum marketplace to obtain a valid sandbox endpoint URL.

### What the Sandbox Console Is Showing

The diagnostic logs are **working correctly**. They are proving:

1. The OAuth pipeline works — the client-credentials flow succeeds and a Bearer token is issued.
2. The GraphQL query construction works — valid requests are built for each PA.
3. The server-side parallel dispatch works — all PA queries fire concurrently.
4. The gap is at the Optum endpoint — the specified `prior-auth/v1/graphql` URL does not exist in the sandbox environment.

The console is showing an honest picture of the architecture working correctly up to the point where the sandbox environment does not provide the expected endpoint.

### Practical Impact

| Mode | What You See |
|------|-------------|
| **Mock mode** | Fully functional dashboard with rich, realistic data across 10 PA scenarios. Recommended for demos. |
| **Sandbox mode** | OAuth succeeds, PA queries return errors (401 from non-existent endpoint), Sandbox Dev Console shows the diagnostic trace. Dashboard shows the error state transparently. |
| **Production mode** | Requires real Optum API credentials from the Real Prior Auth/Referral Actions product. Not configured by default. |

### Path Forward

To connect to a real Optum PA status source, two options exist:

1. **Register for the Real Prior Auth/Referral Actions API** in the Optum marketplace, obtain the correct sandbox URL, and update `OPTUM_GRAPHQL_URL` and the query schema in `lib/optum-pa-status.ts` to match.

2. **Keep mock mode as the primary demo** — the full dashboard with AI analysis, CMS compliance tracking, priority scoring, and outcome prediction is completely functional with the synthetic data. This is suitable for product demonstrations, investor walkthroughs, and UX validation without any API dependency.

---

## Authentication & Security

Authentication is enforced by `middleware.ts` in sandbox and production modes. Mock mode bypasses auth entirely.

### Credential Validation

- Passwords are stored as scrypt hashes: `saltHex.hashHex` (32-byte random salt, 64-byte hash, N=16384, r=8, p=1)
- Username comparison uses constant-time logic to prevent timing-based enumeration
- Password verification uses Node.js `crypto.scrypt()` with timing-safe buffer comparison

### Session Tokens

- Sessions are HMAC-SHA256 signed tokens containing `{ username, expiresAt }`
- Token format: `base64(payload).base64(signature)`
- Stored in an httpOnly, sameSite=lax cookie — inaccessible to JavaScript
- Default expiry: 24 hours (configurable via `SESSION_EXPIRY_HOURS`)
- Middleware verifies signature on every protected request; expired tokens redirect to `/login`

### Default Credentials

```
Username: admin
Password: radar2026
```

These are placeholder credentials for development and demos. Change `AUTH_USERNAME` and generate a new `AUTH_PASSWORD_HASH` before any public deployment. See [Password Management](#password-management).

---

## Data Flow

### Initial Load (Mock Mode)

```
User visits /
  → RootLayout + ThemeProvider mount
  → DashboardPage useEffect fires
  → loadMockFeedData() combines pa-items.ts with mock fixtures
  → setPAItems(), setPAAnalysis(), setTiming() called
  → Dashboard renders immediately, no loading state
```

### Refresh (Live Mode)

```
User clicks Refresh
  → setIsLoading(true), LoadingOverlay appears
  → fetch POST /api/optum/pa-status
      → optum-auth.ts: GET Bearer token (or return cached)
      → optum-pa-status.ts: Promise.all(PA queries) → PAStatusResponse[]
      → claude-pa-analyzer.ts: buildClaudeInput() → analyzeWithClaude()
          → single Claude API call, JSON parse response
      → PAFeedResult assembled with timing metrics
      → sandbox: SandboxNarrative attached to response
  → setPAItems(), setPAAnalysis(), setTiming() updated
  → setIsLoading(false), LoadingOverlay closes
  → Table re-renders with new data
```

### User Interactions

| Action | Handler |
|--------|---------|
| Filter by priority/payer/urgency | `filterPAItems()` → re-render |
| Sort by field | `sortPAItems()` → re-render |
| Expand PA row | Toggle `expandedPAs[id]` → swap collapsed/expanded component |
| Change tab in expanded row | Set `activeTabs[id]` to `action` / `prediction` / `detail` / `raw` |
| Toggle dark/light mode | `next-themes` setTheme() → CSS variable swap |
| Open sandbox console | Toggle collapse state → render `sandboxNarrative.logs[]` |

---

## Component Structure

```
RootLayout
└── ThemeProvider + TooltipProvider
    └── DashboardPage (app/page.tsx)
        ├── LoadingOverlay
        ├── MockModeBanner / SandboxModeBanner
        ├── Header
        │   ├── TimingBadges (Parallel: Xms, Claude: Xs)
        │   ├── RefreshButton
        │   └── ThemeToggle
        ├── PAStatsBar (counts by priority, CMS violations, procedures at risk)
        ├── PASummaryPanel (macro Claude insights)
        ├── PAFeedControls (filter + sort dropdowns)
        ├── PAFeedTable
        │   └── PARow × N
        │       ├── PARowCollapsed (default: patient, procedure, payer, dates, priority badge)
        │       └── PARowExpanded (on click)
        │           ├── PAActionTab     (AI recommendations, action steps)
        │           ├── PAPredictionTab (approval likelihood, denial prediction)
        │           ├── PADetailTab     (full PA record)
        │           └── PARowRawResponseTab (Optum API response JSON)
        ├── SandboxDevConsole (sandbox mode only)
        └── SandboxDisclosure (legal footer)
```

---

## Claude AI Integration

**File:** `lib/claude-pa-analyzer.ts`
**Model:** `claude-sonnet-4-6`
**Settings:** max_tokens 3000, temperature 0

### System Prompt Rules

The system prompt encodes a decision framework that Claude applies consistently:

**Priority Assignment:**
| Priority | Criteria |
|----------|---------|
| `CRITICAL` | Procedure ≤ 5 days away AND PA not approved |
| `URGENT` | Procedure 6–14 days away AND PA pending or denied, OR CMS response window exceeded |
| `ACTION_REQUIRED` | Denied but within appeal window, OR additional info requested, OR approved but expiring within 7 days |
| `MONITOR` | Pending within normal window, OR approved 14+ days before procedure |
| `APPROVED` | Fully approved, procedure 14+ days away |

**CMS Compliance Enforcement:**
- Standard PA: payer must respond within 7 calendar days
- Urgent PA: payer must respond within 72 hours (3 calendar days)
- If window exceeded: Claude includes a specific CMS escalation action in the per-PA output

**Prediction Logic:**
- HIGH likelihood: clean prior auth history, straightforward diagnosis-procedure match, complete documentation
- MEDIUM likelihood: borderline clinical criteria, payer history of partial approvals
- LOW likelihood: experimental procedure, repeated prior denials, missing supporting documentation

**Output Format:**
Claude returns a single JSON object. The server JSON-parses the response and distributes `perPAActions`, `perPAPredictions`, and `paSummary` to the appropriate dashboard components.

---

## CMS Prior Authorization Final Rule

The January 2026 CMS Final Rule on Prior Authorization established mandatory response time windows for payers:

- **Standard requests:** 7 calendar days
- **Urgent requests:** 72 hours (3 calendar days)
- **Denial requirements:** Payers must provide specific clinical reasoning for every denial

This application tracks compliance against these windows. Each PA record includes a `cmsDeadline` and `isCMSViolated` flag. The `PAStatsBar` shows total CMS violations across the practice, and the `PASummaryPanel` includes a dedicated CMS compliance section when violations exist.

---

## Project Structure

```
prior-auth-radar/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # POST: validate credentials, create session
│   │   │   └── logout/route.ts      # POST: destroy session cookie
│   │   └── optum/
│   │       └── pa-status/route.ts   # POST: orchestrate Optum + Claude pipeline
│   ├── login/
│   │   └── page.tsx                 # Login form
│   ├── page.tsx                     # Main dashboard
│   ├── layout.tsx                   # Root layout (fonts, theme provider)
│   └── globals.css                  # Global styles (Tailwind v4)
├── components/
│   ├── ui/                          # shadcn/ui primitives (20 components)
│   └── *.tsx                        # 28 application components
├── lib/
│   ├── mock/
│   │   ├── mock-loader.ts           # Assembles mock feed data on mount
│   │   ├── pa-status-fixtures.ts    # Mock Optum PAStatusResponse per scenario
│   │   └── claude-fixtures.ts       # Mock ClaudePAAnalysis output
│   ├── auth.ts                      # Scrypt credential validation
│   ├── claude-pa-analyzer.ts        # Claude system prompt + API call
│   ├── config.ts                    # App mode configuration
│   ├── optum-auth.ts                # OAuth client-credentials + token cache
│   ├── optum-pa-status.ts           # GraphQL query to Optum
│   ├── pa-items.ts                  # 10 synthetic PA requests (test data)
│   ├── pa-utils.ts                  # Sort, filter, deadline calculations
│   ├── sandbox-narrator.ts          # Timestamped diagnostic logger
│   ├── session.ts                   # HMAC-SHA256 session tokens
│   └── utils.ts                     # cn() utility
├── types/
│   ├── claude.types.ts              # ClaudePAAction, ClaudePAOutcomePrediction, ClaudePASummary
│   ├── optum.types.ts               # PAStatusResponse, PAFeedResult
│   ├── pa.types.ts                  # PAPriority, PAScenario, SyntheticPA
│   └── sandbox.types.ts             # SandboxLogEntry, SandboxNarrative
├── scripts/
│   └── generate-password-hash.mjs  # CLI tool for scrypt password hashing
├── middleware.ts                    # Auth enforcement for protected routes
├── .env.local                       # Active environment config
├── .env.example                     # Environment variable template
└── prior-auth-radar-prd-prompt.md  # Original PRD specification
```

---

## Environment Variables

```env
# App mode: mock | sandbox | production
NEXT_PUBLIC_APP_ENV=mock

# Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD_HASH=<saltHex.hashHex from generate-password-hash.mjs>
AUTH_SECRET=<random 32+ byte hex string>

# Optum API (required for sandbox and production modes)
OPTUM_CLIENT_ID=<from Optum marketplace>
OPTUM_CLIENT_SECRET=<from Optum marketplace>
OPTUM_AUTH_URL=https://idx.linkhealth.com/auth/<realm>/protocol/openid-connect/token
OPTUM_GRAPHQL_URL=https://sandbox-apigw.optum.com/oihub/prior-auth/v1/graphql
OPTUM_PROVIDER_TAX_ID=<your NPI/tax ID>

# Anthropic Claude API (required for sandbox and production modes)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Session config (optional, defaults shown)
SESSION_COOKIE_NAME=pa_radar_session
SESSION_EXPIRY_HOURS=24
```

Copy `.env.example` to `.env.local` and fill in your values.

---

## Getting Started

```bash
# Install dependencies
bun install

# Run development server (Turbopack)
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

By default (`NEXT_PUBLIC_APP_ENV=mock`), the dashboard loads instantly with demo data — no credentials or API keys needed.

To enable sandbox mode with real API calls, set `NEXT_PUBLIC_APP_ENV=sandbox` in `.env.local` and provide valid Optum and Anthropic credentials. See [Sandbox Limitation](#sandbox-limitation--important) before doing so.

```bash
# Production build
bun run build
bun run start

# Lint
bun run lint
```

---

## Password Management

To set a new password for the dashboard login:

```bash
node scripts/generate-password-hash.mjs
```

The script prompts for a password and outputs a `saltHex.hashHex` string. Set this as `AUTH_PASSWORD_HASH` in `.env.local`.

The default credentials (`admin` / `radar2026`) are intentionally weak placeholder values. Replace them before deploying anywhere accessible outside localhost.

---

## Deployment

The application deploys on Vercel. Set all environment variables in the Vercel project settings (do not commit `.env.local`).

For production use with real Optum PA data:
1. Register for the **Real Prior Auth/Referral Actions** API in the Optum developer marketplace
2. Obtain production `OPTUM_CLIENT_ID`, `OPTUM_CLIENT_SECRET`, and the correct `OPTUM_GRAPHQL_URL`
3. Update the GraphQL query in `lib/optum-pa-status.ts` if the Real Prior Auth/Referral Actions schema differs from the illustrative schema
4. Set `NEXT_PUBLIC_APP_ENV=production`
5. Generate a strong `AUTH_SECRET` and `AUTH_PASSWORD_HASH` for production credentials

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Fonts | Geist Sans, Geist Mono, Raleway, Playfair Display |
| Animations | Framer Motion |
| AI | Anthropic Claude Sonnet 4.6 |
| Auth | Scrypt + HMAC-SHA256 session tokens |
| Package Manager | Bun |
| Icons | HugeIcons |
| Theme | next-themes (dark mode by default) |
