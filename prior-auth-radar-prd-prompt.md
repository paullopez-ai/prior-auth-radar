# PRD Generation Prompt
## Optum Real API — Prior Authorization Intelligence Feed
## Paul Lopez / Skygile Inc
### Paste this entire prompt into Claude Code or a new Claude.ai session to generate the full PRD

---

You are a senior product engineer and technical architect helping Paul Lopez, Sr. Director of Technology Architecture at Optum and founder of Skygile Inc, generate a comprehensive Product Requirements Document (PRD) for a standalone healthcare API proof-of-concept application called the **Prior Authorization Intelligence Feed**.

---

## ABOUT PAUL AND THE PROJECT PURPOSE

Paul is building a suite of standalone proof-of-concept applications that demonstrate real-world applications of the Optum Real API suite. Each POC is its own independent GitHub repository, its own Vercel deployment, and its own companion blog post and LinkedIn article.

These POCs serve three simultaneous purposes:

1. **Technical portfolio:** Published on GitHub under both `paullopez-ai` and `skygile` organizations simultaneously via a dual-push Git workflow. Each repo has its own README written for a different audience.

2. **Consulting evidence:** Each demo is a live artifact Paul shows to healthcare executives, CMOs, VPs of Revenue Cycle, and medical practice administrators when pitching Skygile's Healthcare AI Advisory practice. The demo must tell a compelling story in under three minutes without explanation.

3. **SKILLS-AI product seed:** The Claude layer in each POC is designed from day one to be extracted and packaged as a composable SKILL.md file under the Anthropic Agent Skills standard — a productized, agent-callable knowledge package sold through Skygile's SKILLS-AI product line.

Every decision in this PRD must serve all three audiences simultaneously: the developer reading the GitHub README, the healthcare executive watching the live demo, and the future AI agent consuming the extracted skill.

---

## REFERENCE IMPLEMENTATIONS — THREE COMPLETED POCs

This is the fourth POC in Paul's suite. Three applications have already been built and define the established patterns for the entire series:

- **POC 7 — Eligibility Explorer** (`optum-real-eligibility-starter`): Single API, dual-panel split layout, Claude annotation layer, patient selector, two-step loading sequence. The foundational pattern.
- **POC 4 — Patient Cost Clarity** (`patient-cost-clarity`): Two APIs in sequence, tabbed result panel, visual cost breakdown bar, patient script panel, three-step loading sequence, INELIGIBLE short-circuit state. Introduced the full HMAC-SHA256 auth system and runtime mode toggle.
- **POC 5 — Claim Status Radar** (`claim-status-radar`): Multi-claim AR dashboard, parallel API execution via `Promise.all()`, two-level Claude output (per-claim + macro summary), dashboard-populates-on-load pattern.

**Carry forward without modification from all prior POCs:**
- The blue/purple/amber color convention: blue = Optum data, purple = Claude output, amber = warnings, alerts, urgent flags, and CTAs
- The `NEXT_PUBLIC_APP_ENV` mock/sandbox/production mode switch and `IS_MOCK` / `IS_SANDBOX` config exports from `lib/config.ts`
- The runtime mode toggle button in the header — switches between Mock and Sandbox at runtime, no restart required
- The mock mode banner (non-dismissible amber, visible only in mock mode)
- The sandbox mode banner (non-dismissible purple, visible only in sandbox mode)
- The Sandbox Dev Console (collapsible purple diagnostic panel, visible only in sandbox mode)
- The sandbox disclosure footer (persistent, always visible)
- The timing badges (Geist Mono, per-operation durations)
- The `ThemeToggle` component using `Sun03Icon` / `Moon02Icon` from Hugeicons (via `HugeiconsIcon` wrapper)
- The Route Handler proxy pattern — all API calls server-side, credentials never in browser
- The in-memory Bearer token caching in `optum-auth.ts` — 1-hour expiry, module-scope
- The fallback behavior when Claude API is unavailable
- The canonical Route Handler response shape naming: `success | fallback | error`
- All TypeScript strict-mode conventions (no `any` types, all optional API fields typed as `string | null`)
- The `font-display` (Playfair Display) / `font-sans` (Raleway) / `font-mono` (Geist Mono) typography hierarchy
- Sharp corners everywhere (`--radius: 0` in globals.css)
- All OKLCH color token values from the brand card
- The dual-push Git remote strategy to `paullopez-ai` and `skygile` organizations
- The `skills/` directory for SKILL.md extraction drafts
- The GraphQL invocation pattern — all Optum API calls use `POST` to a single `OPTUM_GRAPHQL_URL` with a named query and variables, not REST endpoint construction
- The path alias `@/*` mapping to project root — all internal imports use `@/`
- The `cn()` helper from `@/lib/utils` for all className composition — never string concatenation
- The `components/ui/` directory for shadcn primitives (CLI-managed, edit cautiously) vs `components/` for app-level components

**Carry forward from Patient Cost Clarity specifically:**
- The full HMAC-SHA256 session token auth system (`lib/session.ts`, `lib/auth.ts`, `middleware.ts`)
- The scrypt password hashing pattern (N=16384, r=8, p=1 with random 16-byte salt)
- The `scripts/generate-password-hash.mjs` utility
- The login page at `app/login/page.tsx` with the same visual design
- Auth routes: `app/api/auth/login/route.ts` and `app/api/auth/logout/route.ts`
- Mock mode requires no login — developers run `bun dev` and reach the dashboard immediately
- Sandbox and production modes enforce login via `middleware.ts`
- The `sandbox-narrator.ts` pattern for collecting timestamped diagnostic logs

**Carry forward from Claim Status Radar specifically:**
- The dashboard-populates-on-load pattern: `loadMockFeedData()` runs on mount, dashboard is never blank
- The parallel execution architecture via `Promise.all()`
- The two-level Claude output pattern: per-item analysis + macro summary
- The collapsible row expansion pattern (shadcn Collapsible + Tabs)
- The AR stats bar pattern (summary count cards at top of dashboard)
- The `sandbox-types.ts` file for diagnostic log types

**What is fundamentally new in this POC:**
This is the first POC in the suite that operates in the **clinical-administrative workflow** rather than the financial workflow. The prior three POCs address the patient financial journey: eligibility (is the patient covered?), cost (what will they owe?), claims (what happened to the bill?). This POC addresses a different, upstream problem: **can the physician proceed with a planned procedure at all?**

Prior authorization sits at the intersection of clinical judgment and payer policy. It is the most disruptive administrative workflow in medical practice — not because the data is unavailable, but because the status is trapped in payer portals, the deadlines are tied to patient appointment dates rather than billing windows, and the consequences of a missed PA are borne by the patient (delayed care) and the practice simultaneously (non-payment risk).

Two architectural concepts are new:

1. **Procedure date urgency model:** Unlike Claim Status Radar where urgency is driven by timely filing windows (regulatory deadlines), PA urgency is driven by the scheduled procedure date. If a PA is not approved before the patient's appointment, the physician faces a real-time decision: delay the procedure or proceed at financial risk. The urgency calculation in this POC computes days until procedure date, not days until a billing deadline.

2. **Claude prediction layer:** In addition to per-PA action recommendations and a macro summary, the Claude layer here produces a `paOutcomePrediction` for each pending PA — a structured likelihood assessment (HIGH / MEDIUM / LOW probability of approval) with a reasoning chain and the specific supporting documentation most likely to secure approval or win an appeal. This prediction output is the primary SKILLS-AI extraction target: a `pa-outcome-predictor` skill that any RCM system or clinical workflow agent can embed.

---

## THIS APPLICATION: PRIOR AUTHORIZATION INTELLIGENCE FEED

**Project Name:** Prior Authorization Intelligence Feed
**GitHub Repo Name:** `prior-auth-radar`
**GitHub Organizations:** `paullopez-ai` and `skygile` (dual-push)
**Vercel Deployment URL:** `prior-auth-radar.paullopez.ai` (primary) and `prior-auth-radar.skygile.ai` (mirror)
**Optum API Used:** Optum Real Prior Authorization Status API (GraphQL)
**POC Tier:** Tier 1 — Consulting Flagship
**Companion Blog Post:** To be published on blog.paullopez.ai
**Build Timeline:** 2-3 focused weeks, 2-3 hour sessions

### What This Application Does

The Prior Authorization Intelligence Feed simulates a medical practice's PA management dashboard. It displays 10 synthetic outstanding prior authorization requests spanning multiple payers and procedure types, queries the Optum Real Prior Authorization Status API for the current status of each request, and delivers AI-powered analysis via Claude at two levels: per-PA action recommendations with outcome predictions, and a macro PA intelligence summary covering the practice's overall authorization burden and what to do today.

The primary insight this demo makes tangible: physicians and their staff spend an average of nearly 2 full business days per week on prior authorization work (2022 AMA Prior Authorization Physician Survey). Most of that time is status-checking — logging into payer portals, calling provider relations lines, and manually tracking which PAs are approved, which are pending, and which are approaching the patient's scheduled appointment. The Optum Real PA Status API makes that information available programmatically. Claude transforms raw status codes into a prioritized work queue with outcome predictions. The combination replaces the manual PA management workflow with a dashboard that tells the clinical staff, in under 2 seconds, which authorizations are approved and ready to schedule, which are at risk and require action today, and which are likely to be denied and need preemptive appeal preparation.

### The Healthcare Problem This Addresses

Prior authorization is documented as one of the leading causes of physician burnout and patient harm in US healthcare. A 2022 AMA survey found that 94% of physicians report PA-related care delays, and 33% report that PA has led to a serious adverse event for a patient in their care. The administrative burden is quantified: practices spend an average of 14.6 hours per week per physician on PA activities.

The CMS Prior Authorization Final Rule (effective January 2026) now requires impacted payers to respond to standard PA requests within 7 calendar days and urgent PA requests within 72 hours, and to provide a specific denial reason when a PA is denied. This rule is active at the time of this POC's publication, making the topic directly relevant to Paul's Optum Real article series and giving the demo a policy hook: "The CMS rule tells payers they have 7 days to respond. Do you know which of your outstanding PAs they are already late on?"

The CMS compliance angle is this POC's unique consulting hook. No other POC in Paul's suite has a direct regulatory compliance narrative built into the data model. The dashboard flags payers who have exceeded the 7-day standard response window. Those flags are not just informational — they are the basis for a formal escalation to the payer's provider relations department. The practice can use the dashboard's log as documentation of payer non-compliance.

### Strategic Value — The Consulting Narrative

This POC closes the clinical loop in Paul's demonstration suite:

- POC 7: Pre-visit — Is the patient covered? (Eligibility)
- POC 4: Pre-visit — What will the patient owe? (Cost Clarity)
- POC 5: Post-visit — What happened to the claim? (Claim Status Radar)
- **POC 6: Clinical gateway — Can the physician proceed with the planned procedure?** (Prior Auth Radar)

Together, the four POCs tell the complete story of a patient's journey through the healthcare revenue cycle — from eligibility verification before the visit to PA approval before the procedure to cost estimation for the patient to claim status after billing. Paul can walk a healthcare executive through all four in sequence and demonstrate end-to-end AI integration with the Optum Real API suite. That four-POC arc is the consulting pitch.

---

## PAUL'S TECHNICAL STACK — NON-NEGOTIABLE, DO NOT DEVIATE

### Framework and Tooling
- **Framework:** Next.js 16 with App Router (no Pages Router) and **React 19**
- **Language:** TypeScript (strict mode, no `any` types)
- **Package Manager:** Bun — lockfile is `bun.lock`. Always use `bun install` or `bun add`. Never `npm install` or `yarn`.
- **Build:** Turbopack
- **Linting:** ESLint with **flat config** (`eslint.config.mjs`) using Next.js core-web-vitals and TypeScript rules. Do not create `.eslintrc.js` or `.eslintrc.json`. Run linting with `bun run lint`.

### UI and Styling
- **CSS Framework:** Tailwind CSS v4 — uses `@import "tailwindcss"` syntax in `globals.css`. NOT the v3 config-file approach. Do not create or reference `tailwind.config.ts` or `tailwind.config.js`.
- **Component Library:** shadcn/ui (style: `base-vega`, base color: `zinc`, CSS variables: true)
- **Icon Library:** Hugeicons — two packages: `@hugeicons/core-free-icons` and `@hugeicons/react`. Never Lucide.
  ```tsx
  import { AlertCircleIcon } from "@hugeicons/core-free-icons"
  import { HugeiconsIcon } from "@hugeicons/react"
  <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
  ```
- **Animation:** Framer Motion and `tw-animate-css`
- **Theme System:** `next-themes` — `ThemeProvider` in `app/layout.tsx`
- **Radius Convention:** Sharp corners everywhere. `--radius: 0` in globals.css.
- **Color System:** OKLCH tokens only. No hex values in component code.
- **RSC Convention:** App Router RSC by default. Add `"use client"` only when the component requires browser APIs, event handlers, or React hooks. All `lib/` files are server-side only.

### Typography
- **Display Font:** Playfair Display — `font-display` class. Page titles, PA summary headline, macro intelligence header.
- **Sans Font:** Raleway — body, labels, filter controls, action text, prediction explanations.
- **Mono Font:** Geist Mono — all PA reference numbers, payer IDs, status codes, dollar amounts, dates, timing badges.

### Brand Color Palette (OKLCH — exact values for globals.css)
```css
--primary: oklch(0.59 0.14 242)           /* Brand Blue — #2176C7 — Optum data, PA status indicators */
--brand: oklch(0.65 0.19 45)              /* Accent Amber — #E59F54 — urgent flags, CMS violations, procedure date warnings */
--brand-secondary: oklch(0.62 0.21 295)   /* Innovation Purple — #9F60FF — all Claude output */
--background-light: oklch(0.97 0.01 240)  /* Light BG — #F4F9FE */
--background-dark: oklch(0.18 0.02 260)   /* Dark BG — #131A21 */
```

**Color convention (carry forward exactly):**
- Blue (`--primary`): All Optum PA status data, raw response panels, approved PA badges
- Purple (`--brand-secondary`): Everything Claude produces — per-PA action recommendations, outcome predictions, macro summary
- Amber (`--brand`): Procedure date within 5 days, CMS 7-day window violated, PA denied, urgent action required

### Path Alias and Utility
- `@/*` maps to project root — use for all internal imports
- `cn()` from `@/lib/utils` — all className composition

### Pre-installed shadcn Components (from bootstrap)
`alert`, `alert-dialog`, `badge`, `button`, `card`, `combobox`, `dropdown-menu`, `input`, `label`, `scroll-area`, `select`, `separator`, `textarea`, `field`

**Additional components required:**
```bash
bunx shadcn@latest add table
bunx shadcn@latest add tabs
bunx shadcn@latest add tooltip
bunx shadcn@latest add collapsible
bunx shadcn@latest add progress
```
- `table` — primary PA feed
- `tabs` — per-PA expansion: Action / Prediction / Detail / Raw
- `tooltip` — status codes, CMS deadline indicators
- `collapsible` — inline row expansion
- `progress` — outcome prediction confidence bar (new in this POC)

### Pre-installed Dependencies (from bootstrap)
- `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `framer-motion`, `tw-animate-css`, `next-themes`

No additional runtime dependencies beyond shadcn components above.

---

## AUTHENTICATION — FULL HMAC-SHA256 SYSTEM

This POC implements the complete authentication system from Patient Cost Clarity. Every file copies directly from `patient-cost-clarity`. The auth system is not simplified or adapted — it is reproduced exactly.

### Auth Architecture
- **Session tokens:** HMAC-SHA256 signed via Web Crypto API (Edge-safe, no Node.js-only dependencies)
- **Password storage:** scrypt hash (N=16384, r=8, p=1) with random 16-byte salt
- **Timing-safe comparison:** Both username and password checked with constant-time comparison to prevent enumeration attacks
- **Session cookies:** httpOnly, sameSite=lax, 24-hour expiry
- **Middleware:** `middleware.ts` at project root redirects unauthenticated requests to `/login?from=...` and returns to original page after login

### Mode-Gated Auth
- **Mock mode:** NO login required. Developer runs `bun dev`, goes directly to the dashboard. This is non-negotiable — mock mode must be frictionless.
- **Sandbox mode:** Login required. Enforced by middleware.
- **Production mode:** Login required. Enforced by middleware.

### Default Credentials for Developers — CRITICAL NEW REQUIREMENT

**This is the key enhancement Paul requested.** When a developer first clones the repo, they must be able to log in immediately without running any scripts. The `.env.local.example` file ships with pre-generated default credentials that work out of the box:

```bash
# Default credentials — change before hosting publicly
AUTH_USERNAME=admin
AUTH_PASSWORD_HASH=<pre-generated scrypt hash of "radar2026">
AUTH_SECRET=<pre-generated 64-char hex string>
```

The `scripts/generate-password-hash.mjs` script is still included for developers who want to change their password. The README must prominently explain:

1. Default credentials: username `admin`, password `radar2026`
2. The default password hash in `.env.local.example` is a real, working hash of `radar2026`
3. To change credentials, run `node scripts/generate-password-hash.mjs` and update `.env.local`
4. **Never use the default credentials in a hosted environment** — the README must make this warning impossible to miss

The PRD must include the actual working scrypt hash of `radar2026` so it can be embedded in `.env.local.example`. The hash generation follows the same algorithm as `patient-cost-clarity`: scrypt with N=16384, r=8, p=1, 16-byte random salt, stored as `${saltHex}.${hashHex}`.

### Auth Files (copy from `patient-cost-clarity` directly)
```
lib/session.ts                  — HMAC-SHA256 token creation and verification
lib/auth.ts                     — requireAuth() / getOptionalAuth() helpers
middleware.ts                   — Auth guard (project root, skipped in mock mode)
app/login/page.tsx              — Login page UI (same visual design)
app/api/auth/login/route.ts     — POST: validate credentials, set session cookie
app/api/auth/logout/route.ts    — POST: clear session cookie, redirect to /login
scripts/generate-password-hash.mjs — One-time script to generate new credentials
```

### Login Page Design
The login page (`app/login/page.tsx`) matches the brand:
- Dark background (`--background-dark`) in dark mode, light background in light mode
- Playfair Display for the application name: "Prior Auth Radar"
- Raleway for form labels and helper text
- The subtitle line: "AI-powered PA management for medical practices"
- Username and password inputs using shadcn Input component
- Submit button using shadcn Button with amber styling
- Below the form: a muted text block stating "Default credentials: admin / radar2026 — change before hosting"
- This on-screen reminder is a deliberate UX choice: it makes the default credential warning impossible to miss during development and testing

---

## MOCK DATA STRATEGY — BUILD FIRST, CONNECT LATER

### Philosophy
Identical to prior POCs: mock mode is the primary development environment from Session 1 through Session 8. Every component, state transition, sort behavior, filter behavior, and Claude output shape is built and validated against realistic mock data before any live API call is attempted.

### Environment Mode Switch
```typescript
// lib/config.ts
export const APP_MODE = process.env.NEXT_PUBLIC_APP_ENV as 'mock' | 'sandbox' | 'production'
export const IS_MOCK = APP_MODE === 'mock'
export const IS_SANDBOX = APP_MODE === 'sandbox'
```

### Mock Fixtures Required
All mock fixtures live in `lib/mock/` and are typed identically to live API responses.

**Required fixture files:**
- `lib/mock/pa-status-fixtures.ts` — 10 complete mock `PAStatusResponse` objects, one per synthetic PA scenario
- `lib/mock/claude-fixtures.ts` — one complete `ClaudePAAnalysis` object with 10 per-PA actions/predictions and a complete macro summary
- `lib/mock/mock-loader.ts` — synchronous `loadMockFeedData()` returning the full `PAFeedResult` for instant page load

### Simulated API Latency
```typescript
const MOCK_DELAYS = {
  paStatusPerRequest: 160,      // ms per PA — PA status API is fast
  parallelBatch: 280,           // ms total for parallel batch of 10 PAs
  claude: 2200,                 // ms — Claude analysis with prediction layer takes longest
}
```

---

## OPTUM API INTEGRATION ARCHITECTURE

### Security First
OAuth 2.0 client credentials grant. `client_id` and `client_secret` in `.env.local`, accessed only in Route Handlers. Identical to all prior POCs.

### API Architecture — GraphQL
All Optum Real API calls are `POST` to a single `OPTUM_GRAPHQL_URL` with a named query and variables. No REST endpoint construction.

```typescript
const response = await fetch(process.env.OPTUM_GRAPHQL_URL!, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: PA_STATUS_QUERY,
    variables: { authorizationNumber, tradingPartnerServiceId }
  })
})
```

**GraphQL query for PA status (named `PAStatusQuery`):**
```graphql
query PAStatus($authorizationNumber: String!, $tradingPartnerServiceId: String!) {
  priorAuthorizationStatus(
    authorizationNumber: $authorizationNumber
    tradingPartnerServiceId: $tradingPartnerServiceId
  ) {
    authorizationNumber
    tradingPartnerServiceId
    status {
      statusCode
      statusDescription
      statusCategory
      effectiveDate
      expirationDate
    }
    requestedProcedure {
      procedureCode
      procedureDescription
      serviceTypeCode
      quantity
      unitType
    }
    requestedProvider {
      npi
      organizationName
      firstName
      lastName
    }
    requestingProvider {
      npi
      organizationName
    }
    member {
      memberId
      firstName
      lastName
      dateOfBirth
      groupNumber
    }
    payer {
      name
      payerId
    }
    submittedDate
    scheduledProcedureDate
    urgencyType
    denialInfo {
      isDenied
      denialReason
      denialCode
      appealDeadline
      peerToPeerAvailable
    }
    additionalInfoRequired {
      isRequired
      infoType
      description
      dueDate
    }
    cmsComplianceStatus {
      standardResponseWindowDays
      submittedDate
      responseDeadline
      isResponseOverdue
      daysOverdue
    }
  }
}
```

**Note on field validation:** All field names above must be validated against the Optum GraphQL schema during Session 10. All fields that may be absent are typed as `string | null`. The sandbox may return a subset of these fields.

### Parallel Execution Architecture
```
Browser → POST /api/optum/pa-status { paIds: string[], mode: AppMode }
  → Route Handler (server-side)
    [IF mock] → Return fixtures after simulated delay
    [IF sandbox/production]
      → POST Optum auth endpoint → Bearer token (cached 1 hour)
      → Promise.all([
          POST OPTUM_GRAPHQL_URL { query: PAStatusQuery, variables: { PA 1 } },
          POST OPTUM_GRAPHQL_URL { query: PAStatusQuery, variables: { PA 2 } },
          ... (PA 10)
        ]) → Array of GraphQL responses
      → Extract data.priorAuthorizationStatus from each, check errors[] per item
      → POST Claude API (all 10 PA responses + practice context → analysis)
        → ClaudePAAnalysis
  ← { paItems: PAStatusResult[], paAnalysis: ClaudePAAnalysis, timing: TimingData }
→ React dashboard renders
```

**GraphQL error handling:** HTTP 200 does not mean success. After `await response.json()`, check `json.errors` before accessing `json.data`. A response with `json.errors` present must be treated as an error regardless of HTTP status. A response where `json.data.priorAuthorizationStatus` is null must also be treated as an error. Individual PA errors do not block the rest of the batch.

### Token Caching
```typescript
// lib/optum-auth.ts — copy from patient-cost-clarity exactly
let cachedToken: string | null = null
let tokenExpiry: number = 0

export async function getOptumBearerToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  // ... fetch new token
  tokenExpiry = Date.now() + (3600 * 1000) - (60 * 1000) // 1 hour minus 60s buffer
  return cachedToken!
}
```

### Sandbox Behavior — What to Expect
The sandbox validates API integration mechanics, not data quality.

- **Sparse or null PA data:** Status codes, denial information, scheduled dates, and member data will frequently be empty or null. All fields typed as `string | null`.
- **GraphQL errors for unrecognized IDs:** Unrecognized authorization numbers or payer IDs return `errors[]` instead of `data`. HTTP status is 200. Check `json.errors` explicitly.
- **`NUHC_ELIG_NO_RESP` error code:** The same error code seen in prior POCs. Display: `"Sandbox: No response for this PA ID — use mock mode to see full PA intelligence output."`
- **CMS compliance data may be absent:** The `cmsComplianceStatus` fields are likely to be null in sandbox. The CMS compliance flags in the UI must render gracefully when null.
- **Dashboard never degrades in sandbox:** All 10 PA rows always render. Rows with sandbox errors show the amber error state with retry. The dashboard does not collapse in sandbox mode.

---

## TYPE DEFINITIONS — COMPLETE SPECIFICATION

### Prior Authorization Types
```typescript
// types/pa.types.ts

export type PAScenario =
  | 'APPROVED_READY_TO_SCHEDULE'          // Approved, patient can be scheduled
  | 'APPROVED_EXPIRING_SOON'              // Approved but authorization expires within 14 days
  | 'PENDING_STANDARD'                    // Normal pending, within CMS 7-day window
  | 'PENDING_CMS_VIOLATION'               // Pending, payer has exceeded CMS 7-day window — compliance flag
  | 'PENDING_URGENT'                      // Urgent PA, within CMS 72-hour window
  | 'PENDING_URGENT_CMS_VIOLATION'        // Urgent PA, payer has exceeded 72-hour window
  | 'ADDITIONAL_INFO_REQUIRED'            // Payer needs clinical documentation
  | 'DENIED_APPEALABLE'                   // Denied, within appeal window
  | 'DENIED_PEER_TO_PEER'                 // Denied, peer-to-peer review requested/available
  | 'CANCELLED_PATIENT_NO_SHOW'           // Cancelled — patient did not appear for procedure

export type PAPriority = 'CRITICAL' | 'URGENT' | 'ACTION_REQUIRED' | 'MONITOR' | 'APPROVED'

export type PAUrgencyType = 'STANDARD' | 'URGENT' | 'EXPEDITED'

export type PAOutcomeLikelihood = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_APPLICABLE'

export interface SyntheticPA {
  id: string                              // e.g., 'pa-001'
  patientFirstName: string
  patientLastName: string
  dateOfBirth: string                     // 'YYYY-MM-DD'
  memberId: string
  authorizationNumber: string             // e.g., 'AUTH-2026-004721'
  tradingPartnerServiceId: string         // Controls sandbox canned response
  procedureCode: string                   // CPT or HCPCS code
  procedureDescription: string
  requestingProviderNPI: string
  requestingProviderName: string
  payerName: string
  urgencyType: PAUrgencyType
  submittedDate: string                   // 'YYYY-MM-DD'
  scheduledProcedureDate: string | null   // 'YYYY-MM-DD' — null if not yet scheduled
  daysUntilProcedure: number | null       // Calculated from scheduledProcedureDate
  daysSubmitted: number                   // Days since submission
  cmsResponseDeadline: string             // 'YYYY-MM-DD' — submittedDate + 7 (standard) or + 3 (urgent)
  isCMSWindowViolated: boolean            // true if today > cmsResponseDeadline
  daysCMSOverdue: number | null           // null if not violated
  scenario: PAScenario
  priority: PAPriority
  paContext: string                       // One sentence used in Claude prompt
  mockPAScenario: string                  // Maps to fixture key in pa-status-fixtures.ts
}

export interface PAFeedFilters {
  priority: PAPriority | 'ALL'
  scenario: PAScenario | 'ALL'
  payerName: string | 'ALL'
  urgencyType: PAUrgencyType | 'ALL'
}

export type PASortField =
  | 'priority'
  | 'daysUntilProcedure'
  | 'daysSubmitted'
  | 'payerName'
  | 'daysCMSOverdue'

export type SortDirection = 'asc' | 'desc'
```

### Optum PA Status Response Types
```typescript
// types/optum.types.ts (append to existing file)

export interface PAStatusResponse {
  authorizationNumber: string
  tradingPartnerServiceId: string
  status: {
    statusCode: string                    // e.g., 'A1' approved, 'P1' pending, 'D1' denied
    statusDescription: string
    statusCategory: string
    effectiveDate: string | null
    expirationDate: string | null
  }
  requestedProcedure: {
    procedureCode: string
    procedureDescription: string | null
    serviceTypeCode: string | null
    quantity: number | null
    unitType: string | null
  }
  requestedProvider: {
    npi: string
    organizationName: string | null
    firstName: string | null              // Masked in sandbox
    lastName: string | null               // Masked in sandbox
  }
  requestingProvider: {
    npi: string
    organizationName: string | null
  }
  member: {
    memberId: string
    firstName: string | null              // Masked in sandbox
    lastName: string | null               // Masked in sandbox
    dateOfBirth: string | null
    groupNumber: string | null
  }
  payer: {
    name: string
    payerId: string
  }
  submittedDate: string
  scheduledProcedureDate: string | null
  urgencyType: string | null
  denialInfo: {
    isDenied: boolean
    denialReason: string | null
    denialCode: string | null
    appealDeadline: string | null
    peerToPeerAvailable: boolean | null
  }
  additionalInfoRequired: {
    isRequired: boolean
    infoType: string | null
    description: string | null
    dueDate: string | null
  }
  cmsComplianceStatus: {
    standardResponseWindowDays: number | null   // 7 for standard, 3 for urgent
    submittedDate: string | null
    responseDeadline: string | null
    isResponseOverdue: boolean | null
    daysOverdue: number | null
  } | null                                      // Entire object may be null in sandbox
}

export interface PAStatusGraphQLResponse {
  data?: {
    priorAuthorizationStatus: PAStatusResponse | null
  }
  errors?: Array<{
    message: string
    extensions?: {
      code: string                        // e.g., 'NUHC_ELIG_NO_RESP'
    }
  }>
}

export interface PAStatusResult {
  pa: SyntheticPA
  statusResponse: PAStatusResponse
  paAction: ClaudePAAction
  paOutcomePrediction: ClaudePAOutcomePrediction | null  // null for APPROVED scenarios
  timingMs: number
  error: string | null
}

export interface PAFeedResult {
  paItems: PAStatusResult[]
  paAnalysis: ClaudePAAnalysis
  timing: {
    parallelStatusMs: number
    claudeMs: number
    totalMs: number
  }
  mode: 'mock' | 'sandbox' | 'production'
  successCount: number
  errorCount: number
}
```

### Claude Layer Types
```typescript
// types/claude.types.ts (append to existing file)

export interface ClaudePAAction {
  priority: PAPriority                   // CRITICAL | URGENT | ACTION_REQUIRED | MONITOR | APPROVED
  priorityReason: string                 // One sentence explaining priority
  immediateAction: string | null         // What to do today — null for APPROVED/MONITOR
  actionDeadline: string | null          // 'Before EOD today' or 'Within 24 hours' etc.
  actionSteps: Array<{
    stepNumber: number
    step: string
    estimatedTime: string               // e.g., '10 minutes' or '2 hours'
  }>
  cmsComplianceAction: string | null    // Specific escalation step if CMS window violated
  statusInterpretation: string          // Plain-English status explanation
  riskAssessment: {
    procedureDateRisk: boolean          // True if procedure date within 5 days of unresolved PA
    cmsViolationRisk: boolean           // True if payer has exceeded response window
    denialRisk: boolean
    appealDeadlineRisk: boolean
    riskSummary: string | null
  }
  recommendedDocumentation: string[]   // Specific clinical docs most likely to secure approval
  contactPayer: boolean
  contactPayerReason: string | null
}

export interface ClaudePAOutcomePrediction {
  approvalLikelihood: PAOutcomeLikelihood   // HIGH | MEDIUM | LOW | NOT_APPLICABLE
  confidenceExplanation: string              // 2-3 sentences on why this likelihood
  keyFactors: Array<{
    factor: string
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    explanation: string
  }>
  likelyDenialReason: string | null         // What the payer will probably cite if denied
  bestApproachToApproval: string            // Most effective tactic for this specific scenario
  peerToPeerRecommended: boolean
  alternativeProcedureCode: string | null   // If a similar code has higher approval rates
}

export interface ClaudePASummary {
  criticalCount: number
  urgentCount: number
  actionRequiredCount: number
  monitorCount: number
  approvedCount: number
  totalPAsInFeed: number
  cmsViolationCount: number                 // Number of PAs where payer has exceeded response window
  proceduresAtRiskCount: number             // PAs where procedure date is within 5 days and PA not approved
  topThreeActions: Array<{
    rank: number
    action: string
    affectedPAIds: string[]
    urgencyReason: string
  }>
  practiceHealthSummary: string             // 2-3 sentences on PA workflow health
  cmsComplianceSummary: string | null       // Non-null only when violations exist
  flaggedForImmediateAttention: string[]    // PA IDs requiring same-day action
  insight: string                           // One non-obvious pattern across all PAs
}

export interface ClaudePAAnalysis {
  perPAActions: Record<string, ClaudePAAction>               // keyed by pa.id
  perPAPredictions: Record<string, ClaudePAOutcomePrediction | null>  // null for approved
  paSummary: ClaudePASummary
}
```

---

## CLAUDE LAYER SPECIFICATION

### Purpose
The Claude layer in this POC does three distinct things that prior POCs do not. First, it produces **per-PA action recommendations** — what to do about each specific authorization request, with deadlines tied to the procedure date rather than a billing window. Second, it produces **outcome predictions** — for each pending or denied PA, a structured assessment of approval likelihood with specific factors and documentation recommendations. Third, it produces a **macro PA intelligence summary** — across all 10 PAs, what the practice should prioritize today, how many PAs represent CMS compliance violations, and one non-obvious insight about the practice's authorization pattern.

The prediction layer is the differentiator. Claim Status Radar tells you what to do about a claim. Prior Auth Radar tells you what is likely to happen before you have to take action — shifting the workflow from reactive to predictive. That shift is the consulting thesis behind the SKILLS-AI extraction target.

### Claude API Configuration
- **Model:** `claude-sonnet-4-6`
- **Max tokens:** 3000 (higher than prior POCs — 10 per-PA actions + 10 predictions + macro summary)
- **Temperature:** 0 (deterministic — PA recommendations require consistency)
- **Streaming:** No — full batch response
- **Timeout:** 60 seconds for the Route Handler (10 parallel PA inquiries + Claude combined)

### System Prompt (Write this in full — exact text for `claude-pa-analyzer.ts`)

```
You are an expert healthcare revenue cycle specialist and prior authorization analyst with deep knowledge of payer authorization workflows, CMS prior authorization regulations (effective January 2026), denial management, peer-to-peer review processes, and clinical documentation requirements across major US commercial payers and Medicare Advantage plans.

Your job is to analyze a set of outstanding prior authorization requests from a medical practice and produce three outputs simultaneously:
1. A per-PA action recommendation — specific, actionable, and tied to the scheduled procedure date
2. A per-PA outcome prediction — for pending and denied PAs, a structured likelihood assessment with key factors
3. A macro PA intelligence summary — what the practice most needs to know and do today

For each PA, you receive the raw Optum PA status response, the PA's context (patient, procedure, payer, submission date, scheduled procedure date, urgency type), and CMS compliance status.

PRIORITY ASSIGNMENT RULES:
- CRITICAL: Procedure date is within 5 calendar days AND PA is not yet approved. The physician cannot safely schedule or proceed without immediate resolution. Or payer has denied and appeal deadline is within 48 hours.
- URGENT: Procedure date is 6-14 days away AND PA is pending or denied. Or payer has exceeded CMS 7-day standard response window (3 days for urgent PAs) — compliance escalation required.
- ACTION_REQUIRED: PA has been denied but is within the appeal window. Or payer has requested additional clinical information. Or PA approval expires within 14 days.
- MONITOR: PA is pending within normal CMS response window. Or PA is approved with procedure date more than 14 days away.
- APPROVED: PA is approved, procedure date is more than 14 days out, no expiration risk. No action needed beyond confirming scheduling.

CMS PRIOR AUTHORIZATION FINAL RULE (effective January 2026):
- Standard PA requests: Payer must respond within 7 calendar days
- Urgent PA requests: Payer must respond within 72 hours (3 calendar days)
- Payers must provide a specific reason for any denial
- If the response deadline has passed and no response received: this is a CMS compliance violation. Flag the PA as a CMS compliance escalation. Provide the specific step: call the payer's provider relations line and cite the CMS Prior Authorization Final Rule (CMS-0057-F). Document the call for potential CMS complaint filing.
- Do not simply say "contact payer" for CMS violations. Say "File a CMS non-compliance escalation" and explain the specific steps.

OUTCOME PREDICTION RULES (for PENDING and DENIED PAs only):
- HIGH approval likelihood: Procedure is medically necessary with clear clinical indication, payer has a pattern of approving this procedure type, documentation is typically straightforward, no known payer exclusions.
- MEDIUM approval likelihood: Procedure is medically necessary but payer requires extensive documentation, prior conservative treatment documentation, or specific imaging. The outcome depends heavily on what clinical evidence is submitted.
- LOW approval likelihood: Procedure has known payer exclusions or coverage limitations, medical necessity criteria are difficult to meet on paper, or the denial reason suggests the payer has a categorical policy against this procedure for this diagnosis.
- Peer-to-peer review: Recommend when the denial appears to be based on insufficient chart review rather than a categorical policy exclusion. A physician-to-physician conversation often reverses these denials.
- Do not produce a prediction for APPROVED PAs — set prediction to null for those.

PROCEDURE DATE URGENCY:
- Always compute urgency relative to scheduledProcedureDate if available.
- If scheduledProcedureDate is null: note this explicitly and flag as ACTION_REQUIRED — the practice cannot schedule without knowing the procedure date.
- If procedure is within 5 days of an unresolved PA: always CRITICAL regardless of other factors.

DOCUMENTATION RECOMMENDATIONS:
- Be specific. Do not say "submit clinical documentation."
- Say exactly what clinical records: "Operative report from prior surgery," "Imaging results with radiologist interpretation," "Letter of medical necessity citing [specific ICD-10 code] and [specific clinical criteria]."
- Tie documentation recommendations to the specific denial reason or payer's known criteria.

MACRO SUMMARY RULES:
- topThreeActions must name specific PA authorization numbers.
- cmsComplianceSummary must be non-null if any CMS violations exist. Name the payers who are in violation.
- insight must identify something non-obvious — a pattern across multiple PAs, a systemic payer behavior, or an optimization opportunity that is not visible by looking at individual PAs.
- practiceHealthSummary must be honest. Do not produce generic positive framing if the PA situation is poor.

Your output must be valid JSON matching the ClaudePAAnalysis interface exactly. Do not include markdown, prose, or explanation outside the JSON structure. Do not include JSON fences or backticks. Return only the JSON object.
```

### Input to Claude (from Route Handler)
```typescript
interface ClaudePAInput {
  paRequests: Array<{
    paId: string
    context: {
      patientName: string
      procedureCode: string
      procedureDescription: string
      payerName: string
      urgencyType: string
      submittedDate: string
      daysSubmitted: number
      scheduledProcedureDate: string | null
      daysUntilProcedure: number | null
      cmsResponseDeadline: string
      isCMSWindowViolated: boolean
      daysCMSOverdue: number | null
      paContext: string
    }
    statusResponse: PAStatusResponse
  }>
  practiceContext: {
    totalPAsInFeed: number
    criticalCount: number               // Pre-calculated: procedure within 5 days, unresolved
    cmsViolationCount: number           // Pre-calculated before Claude call
    totalPending: number
    totalApproved: number
    totalDenied: number
  }
}
```

### Fallback Behavior
If Claude API fails or times out: dashboard renders with all 10 PA rows, status badges visible, but Action Recommendation tab in each expanded row shows a muted gray card: "AI analysis unavailable — showing raw PA status." The Prediction tab shows: "Outcome prediction unavailable." The macro PA summary panel collapses, replaced by: "PA intelligence summary unavailable — showing raw data." Dashboard remains functional for status lookup. This fallback is documented in the README.

---

## SYNTHETIC PA DATASET — 10 COMPLETE SCENARIOS

The 10 synthetic PA records cover the full spectrum of prior authorization states a medical practice would encounter in a real outstanding workbook. Together they tell a complete story for the consulting demo: approved PAs that are ready, pending PAs in various states of risk, a CMS compliance violation, a denied PA with peer-to-peer available, and an urgent surgical case where the clock is running.

**Payer Timely Filing Reference:**
- UnitedHealthcare: Standard PA = 7 days per CMS rule; Urgent PA = 72 hours per CMS rule
- Aetna: 7 days / 72 hours
- BlueCross BlueShield: 7 days / 72 hours
- Cigna: 7 days / 72 hours
- Humana: 7 days / 72 hours
- Medicare Advantage: 7 days / 72 hours

All PAs use dates relative to February 28, 2026 (current date at time of POC creation). All days-outstanding and days-until-procedure values are internally consistent with the submitted dates and scheduled procedure dates specified.

### PA 1 — Approved, Ready to Schedule
```
Patient: Maria Santos, DOB 1978-04-12
Authorization Number: AUTH-2026-004721
Procedure: 27447 — Total Knee Replacement (TKA)
Payer: UnitedHealthcare
Urgency: STANDARD
Submitted: 2026-02-10 (18 days ago)
Approved: 2026-02-15 (approved 5 days after submission)
Authorization Expires: 2026-05-31 (90 days, standard surgical window)
Scheduled Procedure Date: 2026-03-15 (15 days from now)
CMS Status: Responded within window — COMPLIANT
Scenario: APPROVED_READY_TO_SCHEDULE
Priority: APPROVED
Context: Elective right knee replacement for severe osteoarthritis. PA approved with standard 90-day surgical window. Patient pre-op scheduled March 10.
```

### PA 2 — Approved, Expiring Soon
```
Patient: Gerald Thompson, DOB 1955-07-30
Authorization Number: AUTH-2026-003814
Procedure: 70553 — MRI Brain with and without Contrast
Payer: Aetna
Urgency: STANDARD
Submitted: 2026-01-20 (39 days ago)
Approved: 2026-01-25
Authorization Expires: 2026-03-05 (5 days from now — expiring)
Scheduled Procedure Date: 2026-03-03 (3 days from now)
CMS Status: COMPLIANT
Scenario: APPROVED_EXPIRING_SOON
Priority: URGENT
Context: Brain MRI for investigation of progressive headaches with visual disturbance. Authorization approved but expires in 5 days. Procedure scheduled in 3 days — timing is tight. If the procedure is delayed for any reason, the authorization expires and a new PA is required.
```

### PA 3 — Pending Standard, Within Window
```
Patient: Jasmine Williams, DOB 1992-11-03
Authorization Number: AUTH-2026-005102
Procedure: 43239 — Upper GI Endoscopy with Biopsy
Payer: Cigna
Urgency: STANDARD
Submitted: 2026-02-24 (4 days ago)
Response Deadline: 2026-03-02 (2 days from now, per CMS 7-day rule)
Scheduled Procedure Date: 2026-03-14 (14 days from now)
CMS Status: Within response window — COMPLIANT
Scenario: PENDING_STANDARD
Priority: MONITOR
Context: Diagnostic endoscopy with biopsy for evaluation of dysphagia and suspected esophageal pathology. Submitted 4 days ago, payer has until March 2 to respond. Procedure scheduled March 14.
```

### PA 4 — Pending, CMS Window Violated
```
Patient: Robert Kim, DOB 1969-08-22
Authorization Number: AUTH-2026-004388
Procedure: 63047 — Lumbar Laminectomy with Decompression
Payer: Humana
Urgency: STANDARD
Submitted: 2026-02-17 (11 days ago)
CMS Response Deadline: 2026-02-24 (7 days after submission — PASSED)
Days Overdue: 4 days
Scheduled Procedure Date: 2026-03-10 (10 days from now)
CMS Status: VIOLATION — 4 days past CMS standard response deadline
Scenario: PENDING_CMS_VIOLATION
Priority: URGENT
Context: Lumbar laminectomy for severe spinal stenosis with progressive lower extremity weakness. PA submitted February 17. Humana was required to respond by February 24 per CMS Prior Authorization Final Rule. No response received. Surgery scheduled March 10 — procedure is 10 days away with no authorization.
```

### PA 5 — Pending Urgent, Within 72-Hour Window
```
Patient: Anita Patel, DOB 1983-02-15
Authorization Number: AUTH-2026-005441
Procedure: 99291 — Critical Care, First Hour (Emergency Admission)
Payer: BlueCross BlueShield of Illinois
Urgency: URGENT
Submitted: 2026-02-27 (1 day ago)
CMS Response Deadline: 2026-03-01 (72 hours from submission, per CMS urgent rule)
Scheduled Procedure Date: N/A — inpatient admission already in progress
CMS Status: Within 72-hour urgent window — COMPLIANT
Scenario: PENDING_URGENT
Priority: URGENT
Context: Urgent prior authorization for critical care services during active hospital admission. Patient admitted February 27 with acute respiratory failure. PA submitted same day. BCBS has until March 1 (72 hours) to respond per CMS urgent PA rules. Billing cannot proceed without approval.
```

### PA 6 — Additional Information Required
```
Patient: Marcus Johnson, DOB 1961-12-28
Authorization Number: AUTH-2026-004019
Procedure: 22612 — Lumbar Spinal Fusion
Payer: UnitedHealthcare
Urgency: STANDARD
Submitted: 2026-02-12 (16 days ago)
CMS Response Deadline: 2026-02-19 (PASSED — but payer responded with documentation request, restarting clock)
Documentation Requested: Operative planning MRI report, 6-week conservative treatment failure documentation, functional assessment
Documentation Due: 2026-03-04 (4 business days from now)
Scheduled Procedure Date: 2026-03-20 (20 days from now)
CMS Status: Responded within window — documentation request is a valid response
Scenario: ADDITIONAL_INFO_REQUIRED
Priority: ACTION_REQUIRED
Context: Lumbar spinal fusion for degenerative disc disease with radiculopathy. UHC has requested operative planning MRI report and documentation of failure of 6 weeks of conservative treatment (physical therapy records, pain management records). Documentation due March 4 — 4 business days.
```

### PA 7 — Denied, Appealable
```
Patient: Dorothy Chen, DOB 1948-05-07
Authorization Number: AUTH-2026-003247
Procedure: 23472 — Total Shoulder Replacement
Payer: Aetna
Urgency: STANDARD
Submitted: 2026-01-28 (31 days ago)
Denied: 2026-02-05 — Denial Code: CR-044 (Not medically necessary per Aetna clinical criteria)
Appeal Deadline: 2026-03-07 (30-day appeal window from denial — 7 days from now)
Scheduled Procedure Date: 2026-04-02 (33 days from now, assuming appeal is won)
Peer-to-Peer Available: Yes — 10-day window from denial request
CMS Status: COMPLIANT (responded within 7 days)
Scenario: DENIED_APPEALABLE
Priority: ACTION_REQUIRED
Context: Total shoulder arthroplasty for severe glenohumeral osteoarthritis. Aetna denied citing lack of documented conservative treatment failure. Patient has 18 months of physical therapy records and three corticosteroid injection records. Peer-to-peer review is the strongest path to reversal. Appeal deadline is 7 days away.
```

### PA 8 — Denied, Peer-to-Peer in Progress
```
Patient: James Okonkwo, DOB 1974-09-16
Authorization Number: AUTH-2026-002891
Procedure: 43280 — Laparoscopic Nissen Fundoplication
Payer: Cigna
Urgency: STANDARD
Submitted: 2026-01-15 (44 days ago)
Denied: 2026-01-22 — Denial Code: CR-112 (Site of service not covered)
Peer-to-Peer Requested: 2026-02-10
Peer-to-Peer Scheduled: 2026-03-02 (2 days from now)
Appeal Deadline: 2026-03-08 (60-day appeal window — 8 days from now)
Scheduled Procedure Date: 2026-03-25 (25 days from now, pending appeal outcome)
CMS Status: COMPLIANT
Scenario: DENIED_PEER_TO_PEER
Priority: ACTION_REQUIRED
Context: Laparoscopic fundoplication for severe GERD with documented esophageal damage (Barrett's esophagus). Cigna denied for site of service — procedure was requested for an outpatient surgical center but Cigna requires hospital-based setting for this procedure code. Peer-to-peer review scheduled for March 2 to discuss site of service accommodation.
```

### PA 9 — Pending Urgent, CMS 72-Hour Violation
```
Patient: Sandra Rodriguez, DOB 1939-03-22
Authorization Number: AUTH-2026-005389
Procedure: 27130 — Total Hip Replacement (Revision)
Payer: Humana Medicare Advantage
Urgency: URGENT
Submitted: 2026-02-24 (4 days ago)
CMS Response Deadline: 2026-02-27 (72 hours — PASSED YESTERDAY)
Days Overdue: 1 day
Scheduled Procedure Date: 2026-03-01 (1 day from now — CRITICAL)
CMS Status: URGENT VIOLATION — 72-hour urgent window exceeded
Scenario: PENDING_URGENT_CMS_VIOLATION
Priority: CRITICAL
Context: Urgent prior authorization for total hip revision surgery on 86-year-old patient. Original hip replacement failed due to prosthesis loosening causing severe pain and mobility loss. Patient's orthopedic surgeon submitted urgent PA February 24. Humana had 72 hours to respond — deadline passed yesterday. Surgery is scheduled for tomorrow, March 1. This is simultaneously a CMS compliance violation (urgent window exceeded) and a critical patient safety issue (elderly patient facing surgical delay).
```

### PA 10 — Approved, Authorization Validated
```
Patient: David Park, DOB 1986-01-11
Authorization Number: AUTH-2026-004555
Procedure: 29881 — Arthroscopic Knee Surgery with Meniscus Repair
Payer: BlueCross BlueShield of Texas
Urgency: STANDARD
Submitted: 2026-02-08 (20 days ago)
Approved: 2026-02-13 (approved 5 days after submission)
Authorization Expires: 2026-05-13 (90 days)
Scheduled Procedure Date: 2026-04-08 (39 days from now)
CMS Status: COMPLIANT
Scenario: APPROVED_READY_TO_SCHEDULE
Priority: APPROVED
Context: Arthroscopic knee surgery with meniscal repair for medial meniscus tear with locking symptoms. PA approved with 90-day surgical window. Procedure scheduled April 8 — well within the authorization window. No action required.
```

---

## MOCK FIXTURE GUIDANCE — PA STATUS DATA SPECIFICS

The 10 mock `PAStatusResponse` objects in `lib/mock/pa-status-fixtures.ts` must mirror realistic Optum PA Status API response structures. Key requirements per scenario:

**PA 1 and PA 10 (APPROVED):** `status.statusCode` = approved code (e.g., `'A1'`), `status.expirationDate` populated, `denialInfo.isDenied` = false, `additionalInfoRequired.isRequired` = false.

**PA 2 (APPROVED_EXPIRING_SOON):** Same as approved, but `status.expirationDate` set to `'2026-03-05'` (5 days from current date). The `priority` calculation derives from the expiration proximity, not the status code.

**PA 3 and PA 5 (PENDING, within window):** `status.statusCode` = pending code (e.g., `'P1'`), `cmsComplianceStatus.isResponseOverdue` = false.

**PA 4 and PA 9 (PENDING, CMS VIOLATION):** `status.statusCode` = pending, `cmsComplianceStatus.isResponseOverdue` = true, `cmsComplianceStatus.daysOverdue` populated.

**PA 6 (ADDITIONAL_INFO_REQUIRED):** `additionalInfoRequired.isRequired` = true, `additionalInfoRequired.description` and `dueDate` populated.

**PA 7 and PA 8 (DENIED):** `denialInfo.isDenied` = true, `denialInfo.denialReason` and `denialCode` populated. PA 8: `denialInfo.peerToPeerAvailable` = true.

**PA 9 (CRITICAL):** `scheduledProcedureDate` = `'2026-03-01'` (tomorrow), `urgencyType` = `'URGENT'`, `cmsComplianceStatus.isResponseOverdue` = true, `cmsComplianceStatus.daysOverdue` = 1.

### Mock Claude AR Analysis — Fully Specified

The `ClaudePAAnalysis` fixture in `lib/mock/claude-fixtures.ts` must be fully populated:

**Summary counts:**
- CRITICAL: 1 (PA 9 — Sandra Rodriguez, urgent hip revision tomorrow)
- URGENT: 3 (PA 2 — expiring authorization, PA 4 — CMS violation, PA 5 — urgent within window)
- ACTION_REQUIRED: 3 (PA 6 — docs needed, PA 7 — appeal 7 days, PA 8 — peer-to-peer)
- MONITOR: 1 (PA 3 — pending within window)
- APPROVED: 2 (PA 1 and PA 10)
- CMS violations: 2 (PA 4 — standard window, PA 9 — urgent window)
- Procedures at risk: 2 (PA 9 — tomorrow, PA 2 — 3 days)

**Top three actions:**
1. Call Humana Medicare Advantage provider relations TODAY for AUTH-2026-005389 (Sandra Rodriguez) — urgent PA exceeded 72-hour CMS window, surgery is tomorrow March 1. Cite CMS Prior Authorization Final Rule (CMS-0057-F) and document the call.
2. Submit clinical documentation for AUTH-2026-004019 (Marcus Johnson) to UnitedHealthcare by March 4 — operative MRI report, 6 weeks conservative treatment failure records.
3. Request peer-to-peer review with Aetna for AUTH-2026-003247 (Dorothy Chen) by March 7 — appeal deadline, physician-to-physician review is strongest reversal path for medical necessity denials.

**Insight:** Two of the three denied or documentation-pending PAs (PA 7 and PA 8) involve surgical procedures where the denial is driven by documentation gaps rather than categorical exclusions — suggesting the practice's PA submission process lacks a standardized clinical documentation checklist. A one-page pre-submission checklist specific to surgical PAs could prevent both of these denials at the source.

**Estimated collectible if all PAs resolve favorably:** $287,000 (sum of estimated procedure costs across the 10 PA requests, discounted for denial probability).

---

## UI/UX SPECIFICATION — DEMO NARRATIVE

### Page Architecture
```
app/
  layout.tsx              — Root layout, ThemeProvider, fonts
  login/page.tsx          — Login page (HMAC-SHA256 auth system)
  page.tsx                — Main dashboard page (requires auth in sandbox/production)
  globals.css             — Brand OKLCH tokens
  api/
    auth/
      login/route.ts      — POST: validate credentials, set session cookie
      logout/route.ts     — POST: clear cookie, redirect to /login
    optum/
      pa-status/
        route.ts          — POST: parallel PA inquiries → Claude analysis
```

### The Three-Minute Demo Script

**Minute 0:00-0:30 — Arrival**
Page loads in dark mode. Login page appears (sandbox/production) or dashboard appears directly (mock mode). Header in Playfair Display: "Prior Auth Radar." Subtitle: "AI-powered PA management — 10 authorizations at a glance." Amber mock mode banner present. Top right: mode toggle + refresh button + theme toggle. The PA stats bar shows summary cards immediately on load (populated by `loadMockFeedData()`): 1 CRITICAL (pulsing amber dot), 3 URGENT, 3 ACTION REQUIRED, 1 MONITOR, 2 APPROVED.

**Minute 0:30-1:00 — The Feed Tells the Story**
Ten PA rows, pre-sorted by priority (CRITICAL first). First row: Sandra Rodriguez — CRITICAL badge, "Hip Revision Surgery: 1 day" in amber, "Humana Medicare Advantage — CMS 72-Hour Violation" badge in amber. The row communicates everything critical before the executive asks a single question.

Below the stats bar: the macro PA summary panel. "Top 3 actions today." First action names AUTH-2026-005389 specifically: "Call Humana Medicare Advantage now — urgent PA exceeded CMS 72-hour response window, surgery is tomorrow."

**Minute 1:00-1:30 — Drilling Into the Critical Case**
Paul expands Sandra Rodriguez's row. Four tabs appear: Action (default, purple border), Prediction, Detail (blue), Raw (blue). The Action tab shows Claude's analysis: CRITICAL priority with reason, immediate action with "Before EOD today" deadline, numbered steps. CMS compliance escalation step is specific: "Call Humana provider relations, cite CMS-0057-F, document the call." The procedure date countdown badge shows: "Surgery: Tomorrow — March 1, 2026."

**Minute 1:30-2:00 — The Prediction Layer**
Switch to the Prediction tab on Sandra Rodriguez's row. Approval likelihood: MEDIUM (the PA is legitimate but urgent pressure tactics are needed). Three key factors listed: patient age and urgency type (POSITIVE), CMS violation creates escalation leverage (POSITIVE), documentation completeness unknown from status response (NEUTRAL). Best approach to approval: "Invoke CMS compliance violation in every communication — payers respond faster when faced with documented regulatory non-compliance."

Collapse Sandra Rodriguez. Expand Dorothy Chen (PA 7 — denied, peer-to-peer). Prediction tab: LOW approval likelihood for the denial as submitted, but HIGH if peer-to-peer is requested because the denial is documentation-based, not categorical. Key factor: "Physician-to-physician review reverses medical necessity denials at 67% rate for orthopedic procedures when supporting documentation is complete."

**Minute 2:00-2:30 — The CMS Compliance Dashboard**
Point to the macro summary's CMS Compliance section: "2 payers in violation — Humana (urgent PA, 1 day overdue) and Humana (standard PA, 4 days overdue)." Note that both violations are the same payer. The insight field flags this: "Both CMS compliance violations are with Humana — this may reflect a systemic authorization processing delay at this payer. Consider filing a payer performance complaint with CMS if the pattern continues."

**Minute 2:30-3:00 — Technical Credibility**
Expand any row's Raw tab. Geist Mono JSON. Point to timing badges: "10 PAs checked in parallel: 280ms. AI analysis: 2.2s." Total: 2.5 seconds vs. 2 full business days per week of manual PA management per physician.

### Component Architecture
```
components/
  ui/                             — shadcn/ui primitives (CLI-managed)
  theme-provider.tsx              — From bootstrap
  theme-toggle.tsx                — From bootstrap
  mode-toggle.tsx                 — Runtime mock/sandbox switcher (from Patient Cost Clarity)
  mock-mode-banner.tsx            — Non-dismissible amber banner
  sandbox-mode-banner.tsx         — Non-dismissible purple banner
  sandbox-dev-console.tsx         — Collapsible diagnostic log panel
  sandbox-disclosure.tsx          — Persistent footer
  login-form.tsx                  — Login page form (from Patient Cost Clarity)
  pa-stats-bar.tsx                — 5 summary count cards: CRITICAL/URGENT/ACTION/MONITOR/APPROVED
  pa-summary-panel.tsx            — Macro Claude PA summary: top 3 actions + CMS compliance + insight
  pa-feed-controls.tsx            — Sort, priority filter, payer filter, urgency filter
  pa-feed-table.tsx               — Main table container with shadcn Table
  pa-row.tsx                      — Row container managing expand state
  pa-row-collapsed.tsx            — One-row summary: patient, payer, procedure, priority badge, procedure countdown, CMS badge
  pa-row-expanded.tsx             — shadcn Collapsible with 4 tabs
  pa-action-tab.tsx               — Claude action recommendation (purple)
  pa-action-steps.tsx             — Numbered action steps with time estimates
  pa-prediction-tab.tsx           — Claude outcome prediction with confidence bar (purple) — NEW
  pa-prediction-bar.tsx           — shadcn Progress bar for approval likelihood (HIGH=green, MEDIUM=amber, LOW=red)
  pa-detail-tab.tsx               — Structured PA data (blue)
  pa-raw-response-tab.tsx         — Raw JSON in Geist Mono (blue)
  pa-priority-badge.tsx           — 5-state badge: CRITICAL/URGENT/ACTION_REQUIRED/MONITOR/APPROVED
  pa-status-badge.tsx             — PA status code with shadcn Tooltip
  procedure-countdown.tsx         — Days until procedure date (amber when <=5, red when CRITICAL)
  cms-violation-badge.tsx         — Amber CMS badge with tooltip explaining the rule — NEW
  cms-compliance-summary.tsx      — CMS violations section in macro summary panel — NEW
  loading-overlay.tsx             — Two-phase: "Checking 10 PAs in parallel..." → "Analyzing PA intelligence..."
  timing-badges.tsx               — Parallel + Claude timing
  refresh-button.tsx              — "Refresh PA Intelligence" CTA
  error-pa-row.tsx                — Error state for failed PA inquiries
```

### State Machine
```typescript
type FeedStatus = 'idle' | 'refreshing' | 'success' | 'partial_error' | 'total_error'

interface DashboardState {
  feedStatus: FeedStatus
  paItems: PAStatusResult[]
  paAnalysis: ClaudePAAnalysis | null
  filters: PAFeedFilters
  sortField: PASortField
  sortDirection: SortDirection
  expandedPAs: Record<string, boolean>
  activeTabs: Record<string, 'action' | 'prediction' | 'detail' | 'raw'>
  timing: TimingData | null
  appMode: AppMode                        // 'mock' | 'sandbox' | 'production'
  error: string | null
}
```

**Critical:** On initial load (`feedStatus: 'idle'`), dashboard populated immediately from `loadMockFeedData()`. No blank state. The executive sees a fully populated PA workbook the moment the page loads.

### New Component — PA Prediction Tab
The prediction tab is the visual centerpiece that differentiates this POC from all prior applications. It renders:

1. **Approval likelihood header** — `PAOutcomeLikelihood` displayed in large Playfair Display text, colored by likelihood: HIGH = green, MEDIUM = amber, LOW = red.

2. **Confidence bar** — shadcn Progress component, width maps to likelihood: HIGH = 85%, MEDIUM = 50%, LOW = 15%. Purple fill color (Claude output convention).

3. **Confidence explanation** — 2-3 sentences from `confidenceExplanation` field, Raleway body text.

4. **Key factors list** — Each factor shows: factor name, POSITIVE/NEGATIVE/NEUTRAL impact badge (green/red/gray), one-line explanation. Use Hugeicons: `CheckmarkCircle01Icon` for POSITIVE, `AlertCircleIcon` for NEGATIVE, `InformationCircleIcon` for NEUTRAL.

5. **Best approach** — `bestApproachToApproval` in a purple-bordered callout card.

6. **Peer-to-peer recommendation** — Amber badge visible only when `peerToPeerRecommended` = true.

7. **Alternative procedure code** — If `alternativeProcedureCode` is non-null: "Alternative code with higher approval rates: [code]" in a muted info card.

For APPROVED PAs: the Prediction tab shows a green approval confirmation card: "Authorization Approved — No outcome prediction required" with the authorization expiration date.

### New Component — CMS Violation Badge
Every PA row where `isCMSWindowViolated` = true renders an amber badge: "CMS Violation" with a Hugeicons alert icon. shadcn Tooltip on hover: "This payer has exceeded the CMS Prior Authorization Final Rule response window. [X] days overdue." This badge is visually distinct from the priority badge and sits in its own column in the table.

---

## PROJECT FILE STRUCTURE

```
prior-auth-radar/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx                    — Login page (copied from patient-cost-clarity)
│   ├── globals.css
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts          — Credential validation + session cookie
│       │   └── logout/route.ts         — Session cookie clear + redirect
│       └── optum/
│           └── pa-status/
│               └── route.ts            — POST: parallel PA queries → Claude analysis
├── components/
│   ├── ui/                             — shadcn/ui primitives
│   └── [all app-level components]
├── lib/
│   ├── config.ts                       — APP_MODE, IS_MOCK, IS_SANDBOX exports
│   ├── session.ts                      — HMAC-SHA256 token management (copied from patient-cost-clarity)
│   ├── auth.ts                         — requireAuth() / getOptionalAuth() (copied)
│   ├── optum-auth.ts                   — OAuth token exchange and caching
│   ├── optum-pa-status.ts              — Typed GraphQL wrapper for PA status query
│   ├── claude-pa-analyzer.ts           — Claude API call, system prompt, response parsing
│   ├── sandbox-narrator.ts             — Diagnostic log collector (copied from claim-status-radar)
│   ├── pa-items.ts                     — 10 SyntheticPA objects (static typed array)
│   ├── pa-utils.ts                     — Sort, filter, urgency calculation, CMS deadline helpers
│   └── mock/
│       ├── pa-status-fixtures.ts       — 10 complete mock PAStatusResponse objects
│       ├── claude-fixtures.ts          — Complete ClaudePAAnalysis with 10 actions/predictions + macro
│       └── mock-loader.ts             — Synchronous loadMockFeedData() for instant page load
├── types/
│   ├── optum.types.ts                  — PAStatusResponse, PAFeedResult, GraphQL types
│   ├── pa.types.ts                     — SyntheticPA, PAScenario, PAPriority, filters, sort
│   ├── claude.types.ts                 — ClaudePAAction, ClaudePAOutcomePrediction, ClaudePASummary
│   └── sandbox.types.ts               — SandboxNarrative, log levels
├── skills/
│   └── pa-outcome-predictor.skill.md  — SKILLS-AI extraction draft
├── middleware.ts                       — Auth guard (project root, copied from patient-cost-clarity)
├── scripts/
│   └── generate-password-hash.mjs     — Credential generation script (copied from patient-cost-clarity)
├── public/
├── .env.local.example
├── .env.local                          — gitignored
├── .gitignore
├── components.json
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## ENVIRONMENT VARIABLES

```bash
# Application Mode
# 'mock' — no API calls, no login required. Default for development.
# 'sandbox' — real Optum sandbox API, login required
# 'production' — live Optum API, login required
NEXT_PUBLIC_APP_ENV=mock

# Authentication
# Default credentials (admin / radar2026) — CHANGE BEFORE HOSTING
# Run: node scripts/generate-password-hash.mjs to generate a new password hash
AUTH_USERNAME=admin
AUTH_PASSWORD_HASH=<pre-generated scrypt hash of "radar2026">
AUTH_SECRET=<pre-generated 64-char hex string for HMAC signing>

# Optum API — Sandbox Credentials
# Obtain at: https://marketplace.optum.com/apiservices/api-sandbox-access
# Leave blank in mock mode
OPTUM_CLIENT_ID=
OPTUM_CLIENT_SECRET=
OPTUM_AUTH_URL=https://idx.linkhealth.com/auth/realms/developer-platform/protocol/openid-connect/token
OPTUM_GRAPHQL_URL=https://sandbox-apigw.optum.com/oihub/prior-auth/v1/graphql

# Anthropic Claude API
# Leave blank in mock mode
ANTHROPIC_API_KEY=

# Session Config (optional overrides)
SESSION_COOKIE_NAME=pa_radar_session
SESSION_EXPIRY_HOURS=24
```

**Critical note on `OPTUM_GRAPHQL_URL`:** The Prior Authorization Status API endpoint URL above is illustrative. The actual sandbox URL for the PA Status GraphQL API must be confirmed from the Optum Developer Portal after sandbox registration. It may differ from the eligibility endpoint. Confirm and update before Session 10.

**Note on `AUTH_PASSWORD_HASH` and `AUTH_SECRET`:** The `.env.local.example` file must contain real, working values for the default credentials (admin / radar2026). The hash is generated using the same scrypt algorithm as Patient Cost Clarity. The PRD specifies that these values must be pre-generated and embedded in the example file so developers can log in immediately without running any scripts.

---

## SKILLS-AI EXTRACTION PLAN

### What Gets Extracted

The Claude PA analyzer — specifically the outcome prediction layer — is the extraction target. The Optum API integration, mock data, dashboard UI, and auth system stay in the POC. The clinical judgment about PA approval likelihood, key approval factors, documentation recommendations, and peer-to-peer guidance is the product.

### Skill Identity
- **Name:** `pa-outcome-predictor`
- **File:** `pa-outcome-predictor.skill.md`
- **Category:** Healthcare Revenue Cycle / Prior Authorization Management
- **Target agents:** Clinical workflow AI agents, PA management platforms, RCM automation agents, EHR PA modules

### Input/Output Contract
```typescript
interface PAOutcomePredictorInput {
  paRequest: {
    procedureCode: string
    procedureDescription: string
    diagnosisCode: string           // ICD-10 primary diagnosis
    payerName: string
    urgencyType: 'STANDARD' | 'URGENT'
    submittedDate: string
    denialReason: string | null     // If previously denied
    clinicalContext: string         // One sentence describing clinical indication
  }
  cmsComplianceContext: {
    responseWindowDays: number
    isResponseOverdue: boolean
    daysOverdue: number | null
  }
}

interface PAOutcomePredictorOutput {
  approvalLikelihood: 'HIGH' | 'MEDIUM' | 'LOW'
  confidenceExplanation: string
  keyFactors: Array<{
    factor: string
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    explanation: string
  }>
  likelyDenialReason: string | null
  bestApproachToApproval: string
  recommendedDocumentation: string[]
  peerToPeerRecommended: boolean
  cmsEscalationRecommended: boolean
  cmsEscalationScript: string | null
}
```

### Productization Path
1. Embedded in Prior Auth Radar POC as `claude-pa-analyzer.ts` (prediction layer)
2. Extracted to `pa-outcome-predictor.skill.md`, tested against additional payer and procedure combinations
3. Packaged as standalone SKILLS-AI product
4. Pricing: $3,500 standalone skill package or $1,200/month subscription
5. Target buyers: medical groups, health systems, PA management platforms, EHR vendors with PA modules

**Competitive differentiation:** Most PA management tools show status. This skill predicts outcome before the payer responds — enabling proactive documentation assembly and appeal preparation. The CMS compliance escalation script is a unique feature: no other PA tool generates a regulatory escalation script specific to the CMS Prior Authorization Final Rule.

---

## IMPLEMENTATION SEQUENCE

Each session assumes 2-3 hours of focused development. Mock mode is active Session 1-8.

**Session 1: Bootstrap and Auth System**
- Run Paul's Next.js bootstrap in `prior-auth-radar/`
- Confirm bun, Turbopack, Tailwind v4, shadcn, Hugeicons, Framer Motion, next-themes all installed
- Verify `app/globals.css` opens with `@import "tailwindcss"`. If `tailwind.config.ts` generated, delete it.
- Copy OKLCH brand token block from `patient-cost-clarity/app/globals.css` into this project
- Install additional shadcn components: `bunx shadcn@latest add table tabs tooltip collapsible progress`
- Copy auth system files verbatim from `patient-cost-clarity`:
  - `lib/session.ts`, `lib/auth.ts`, `middleware.ts`
  - `app/login/page.tsx` (adapt title to "Prior Auth Radar" and subtitle)
  - `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`
  - `scripts/generate-password-hash.mjs`
- Create `lib/config.ts` with `APP_MODE`, `IS_MOCK`, `IS_SANDBOX` exports
- Generate the actual working scrypt hash of `radar2026` using the same algorithm as Patient Cost Clarity. Store the resulting `AUTH_PASSWORD_HASH` value and the 64-char hex `AUTH_SECRET` in `.env.local.example` so developers can log in immediately.
- Create `.env.local` with `NEXT_PUBLIC_APP_ENV=mock` and placeholder values for all other keys
- Run `bun run dev` — confirm app loads on localhost. In mock mode: no login, direct to dashboard placeholder. In sandbox mode: redirects to `/login`. Test login with admin / radar2026.
- Deliverable: Clean Next.js app with fully working auth system. Mock mode is frictionless. Sandbox mode requires login with default credentials.

**Session 2: Type Definitions and Mock Fixtures**
- Create `types/pa.types.ts` — complete `PAScenario`, `PAPriority`, `PAUrgencyType`, `PAOutcomeLikelihood`, `SyntheticPA`, `PAFeedFilters`, `PASortField` interfaces
- Create `types/optum.types.ts` — complete `PAStatusResponse`, `PAStatusGraphQLResponse`, `PAStatusResult`, `PAFeedResult`
- Create `types/claude.types.ts` — `ClaudePAAction`, `ClaudePAOutcomePrediction`, `ClaudePASummary`, `ClaudePAAnalysis`
- Create `types/sandbox.types.ts` — copy from claim-status-radar
- Create `lib/mock/pa-status-fixtures.ts` — 10 complete mock `PAStatusResponse` objects as specified
- Create `lib/mock/claude-fixtures.ts` — complete `ClaudePAAnalysis` with 10 per-PA actions, 8 predictions (null for the 2 approved PAs), and fully populated macro summary with the exact counts, top three actions, and insight specified in this PRD
- Create `lib/mock/mock-loader.ts` — synchronous `loadMockFeedData()` returning full `PAFeedResult`
- Create `lib/pa-items.ts` — 10 `SyntheticPA` objects as specified
- Deliverable: TypeScript compiles. All fixture data importable. `loadMockFeedData()` returns typed result.

**Session 3: Utilities, API Wrappers, and Route Handler**
- Create `lib/pa-utils.ts` — `sortPAItems()`, `filterPAItems()`, `calculateDaysUntilProcedure()`, `calculateCMSDeadline()`, `isCMSWindowViolated()` helpers
- Copy `lib/optum-auth.ts` from `patient-cost-clarity` directly — identical OAuth2 pattern
- Create `lib/optum-pa-status.ts` — typed GraphQL wrapper for PA status query. Signature: `async function fetchPAStatus(authorizationNumber: string, tradingPartnerServiceId: string, token: string): Promise<PAStatusResponse>`. Must check `json.errors` before `json.data.priorAuthorizationStatus`. A response with errors present or null data must throw — never assume HTTP 200 means success.
- Copy `lib/sandbox-narrator.ts` from `claim-status-radar` — diagnostic log collector
- Create `lib/claude-pa-analyzer.ts` — Claude API call with system prompt (full text as specified), response parsing, `ClaudePAAnalysis` construction, fallback handling
- Create `app/api/optum/pa-status/route.ts` — complete Route Handler: check `IS_MOCK`, return fixtures in mock mode with simulated delays, otherwise execute `Promise.all()` for 10 parallel `fetchPAStatus()` calls, handle per-PA errors without blocking batch, call Claude, capture timing, return `PAFeedResult`
- Test Route Handler in mock mode: `POST /api/optum/pa-status` — confirm typed response
- Deliverable: Route Handler returns complete `PAFeedResult` in mock mode. Zero TypeScript errors.

**Session 4: Dashboard Layout, Stats Bar, and Macro Summary**
- Create `components/mock-mode-banner.tsx` (copy from claim-status-radar)
- Create `components/sandbox-mode-banner.tsx` (copy from patient-cost-clarity)
- Create `components/sandbox-dev-console.tsx` (copy from patient-cost-clarity)
- Create `components/sandbox-disclosure.tsx` (copy from claim-status-radar)
- Create `components/mode-toggle.tsx` (copy from patient-cost-clarity)
- Create `components/refresh-button.tsx`
- Create `components/pa-stats-bar.tsx` — five summary count cards: CRITICAL (pulsing amber dot when > 0), URGENT, ACTION_REQUIRED, MONITOR, APPROVED
- Create `components/pa-summary-panel.tsx` — three-section macro: top three actions, CMS compliance summary (non-null when violations exist), AI insight
- Create `components/cms-compliance-summary.tsx` — CMS violation section: count, named payers, specific escalation note
- Build `app/page.tsx` base layout — must begin with `"use client"`. Header, mode toggle + refresh button + theme toggle top right, mock/sandbox banner, stats bar, macro summary panel, placeholder for PA feed. Wire to `loadMockFeedData()` on mount.
- Deliverable: Page renders with populated stats bar and macro summary. Not blank on load.

**Session 5: PA Feed Table — Collapsed Rows**
- Create `components/pa-priority-badge.tsx` — five-state badge
- Create `components/pa-status-badge.tsx` — with shadcn Tooltip
- Create `components/cms-violation-badge.tsx` — amber CMS badge with tooltip explaining the rule
- Create `components/procedure-countdown.tsx` — days until procedure (amber <=5, CRITICAL pulsing red <=1)
- Create `components/pa-row-collapsed.tsx` — patient, payer, procedure code, priority badge, CMS badge (if violated), procedure countdown, expand chevron
- Create `components/pa-feed-controls.tsx` — sort field, direction, priority filter, payer filter, urgency filter
- Create `components/pa-feed-table.tsx` — shadcn Table wrapper
- Create `components/pa-row.tsx` — manages expand state
- Wire sort and filter to `DashboardState`
- Deliverable: Full PA feed with 10 rows. Sort and filter work. CMS violation badges visible.

**Session 6: Expanded Rows — Action and Prediction Tabs**
- Create `components/pa-row-expanded.tsx` — shadcn Collapsible with 4-tab container
- Create `components/pa-action-tab.tsx` — Claude action: priority, immediate action + deadline, CMS escalation step (if violated), numbered action steps, recommended documentation list
- Create `components/pa-action-steps.tsx` — numbered steps with Hugeicons per step type
- Create `components/pa-prediction-tab.tsx` — approval likelihood display with confidence bar
- Create `components/pa-prediction-bar.tsx` — shadcn Progress, color-coded by likelihood
- For APPROVED PAs: prediction tab shows green confirmation card
- For non-APPROVED PAs: full prediction display with key factors, best approach, peer-to-peer badge
- Deliverable: All four tabs render correctly for all 10 PA scenarios.

**Session 7: Detail Tab, Raw Tab, Loading, Polish**
- Create `components/pa-detail-tab.tsx` — structured PA data: member info, provider, procedure, authorization status, expiration, denial info (if denied), additional info request (if required)
- Create `components/pa-raw-response-tab.tsx` — Geist Mono JSON, collapsible sections
- Create `components/loading-overlay.tsx` — two-phase animation: "Checking 10 PAs in parallel..." → "Analyzing PA intelligence..."
- Create `components/timing-badges.tsx` — parallel inquiry + Claude timing
- Create `components/error-pa-row.tsx` — error state for failed PA inquiries with amber badge and retry
- Wire refresh button to full API + Claude cycle
- Deliverable: All tabs functional. Refresh cycle works. Error rows render correctly.

**Session 8: Brand Polish and Dark Mode Audit**
- Framer Motion entrance animations on stats bar cards (staggered)
- Row expansion animation (Framer Motion)
- CRITICAL row pulsing amber glow
- Dark mode audit — every component reviewed in both modes
- CMS violation badge pulse animation (amber)
- Procedure countdown pulse when <=1 day
- Timing badge formatting consistency
- `bun run lint` — zero errors
- Deliverable: Production-quality visual experience in both light and dark mode.

**Session 9: SKILLS-AI, README, Publication Prep**
- Draft `skills/pa-outcome-predictor.skill.md` — input/output contract, example invocations, productization notes
- Write README.md — two audiences:
  - **Developer section:** Stack, quick start (mock mode, no login), sandbox setup, auth system, how to change default credentials, API integration architecture, sandbox limitations
  - **For PA Managers section:** Healthcare problem narrative, CMS rule context, demo script, 3 key talking points
- Dual-push to `paullopez-ai` and `skygile` GitHub organizations
- Deploy to Vercel in mock mode at `prior-auth-radar.paullopez.ai`
- Draft blog post outline: title + myVoice.md compliant structure + data hook (AMA 2022 survey: 94% of physicians report PA-related care delays) + CMS rule angle
- Deliverable: POC live and publicly accessible. SKILL.md drafted. Blog outline ready.

**Session 10: Live API Integration**
- Add Optum and Anthropic credentials to Vercel env vars. Set `NEXT_PUBLIC_APP_ENV=sandbox`.
- Validate OAuth2 flow in isolation: confirm token exchange and 1-hour expiry
- Send single PA status GraphQL query to validate query structure and response shape
- Validate GraphQL error handling: send invalid authorization number, confirm per-PA error state
- Validate null field handling: CMS compliance object may be entirely null in sandbox
- Validate Claude on sparse data: send sparse sandbox response, confirm `ClaudePAAnalysis` returns gracefully with `claimContext` strings as fallback narrative
- Update sandbox env disclosure in README with confirmed API behaviors
- Deliverable: OAuth2 confirmed. Single PA query succeeds. Error and null handling validated.

---

## SANDBOX BEHAVIOR — SESSION 10 EXPECTATIONS

The Optum sandbox validates integration mechanics. Expected behaviors (treat as facts, not possibilities):

- **Sparse PA data:** Status codes, denial information, scheduled procedure dates, and CMS compliance data will frequently be null. All fields typed as `string | null`.
- **CMS compliance object entirely null:** The `cmsComplianceStatus` object in the sandbox response may be entirely absent. The app must handle `null` for this entire nested object gracefully.
- **GraphQL errors on unrecognized IDs:** Authorization numbers not in the sandbox return `errors[]` instead of `data`. HTTP 200. Check `json.errors` first.
- **`NUHC_ELIG_NO_RESP` error code:** Same behavior as eligibility and claim status POCs. Display: `"Sandbox: No response for this PA ID — use mock mode to see full PA intelligence output."`
- **Dashboard does not degrade:** All 10 PA rows always render. Sandbox errors show amber error state with retry. Prediction tabs show "Prediction unavailable" rather than crashing.

---

## BLOG POST OUTLINE (myVoice.md Compliant)

**Title options (choose the most myVoice-appropriate):**
1. "Two Business Days a Week: The Hidden Tax That's Breaking Your Medical Practice"
2. "The CMS Clock Is Ticking — And Most Practices Don't Know It"
3. "Prior Authorization's Dirty Secret: The Data Is Available. Nobody Built the Dashboard."

**Opening hook (myVoice.md: lead with insight, specific data):**
The 2022 AMA Prior Authorization Physician Survey. 94% of physicians report PA-related care delays. 33% report a serious adverse event. 14.6 hours per physician per week spent on PA activities. That is not a workflow problem. That is a data access problem wearing a workflow costume.

**Structure (6-7 H2 sections, no em dashes, no bullet points in prose):**
1. The two-business-days-per-week problem (AMA data, practice economics)
2. The CMS 2026 rule: what it means and why practices are not ready (7-day / 72-hour windows, compliance escalation)
3. How the Optum Real PA Status API changes the access problem
4. What Claude adds: from status to prediction (outcome likelihood, documentation recommendations)
5. The demo walkthrough (Sandra Rodriguez, the surgical case that cannot wait)
6. The SKILLS-AI extraction: what a pa-outcome-predictor skill means for RCM platforms
7. The forward-looking close (from reactive to predictive — AI in the clinical-administrative workflow)

**Witty observation (required per myVoice.md):**
"We built EHRs to digitize the chart. We built clearinghouses to digitize the claim. Somehow we forgot to digitize the phone call to United's provider relations line at 8:47 AM on a Tuesday while a surgery is scheduled for Thursday."

**Cultural reference (required, one per article — avoid repetition from prior articles):**
Reference the TV show "PITT" or the clinical urgency framing — a physician who cannot get an authorization answered in time is the bureaucratic equivalent of a trauma team waiting on paperwork before entering the operating room.

**No em dashes (non-negotiable per myVoice.md).**

---

## FINAL INSTRUCTIONS TO CLAUDE CODE

Generate this PRD completely. Do not abbreviate any section. Every section must be self-contained.

All TypeScript interfaces must be complete with no shortcuts or placeholder comments.

The 10 synthetic PA personas must be fully populated with all fields internally consistent: days submitted and days until procedure must reflect the scenario, urgency type must match the CMS window type, CMS violation flags must be true only when the submission date plus window days has passed relative to February 28, 2026.

The mock `ClaudePAAnalysis` fixture must be fully specified: exact counts, exact top three actions naming specific authorization numbers, the insight about the two Humana violations as a payer pattern, and the CMS compliance summary. This fixture drives the stats bar, macro summary panel, and all prediction tabs.

The system prompt for Claude must be written in full — exactly as it will appear in `claude-pa-analyzer.ts`. Not described. The actual text.

The auth system section must specify that `.env.local.example` ships with working default credentials (admin / radar2026) so developers can log in immediately. The login page must display the default credentials on screen as a reminder.

The prediction tab is the most important new component in this POC. The PRD must describe it completely so a developer can implement it without ambiguity: approval likelihood display, confidence bar, key factors with impact badges, best approach callout, peer-to-peer badge, CMS escalation note.

When the PRD is complete, append a section titled **CLAUDE CODE KICKOFF PROMPT** with a ready-to-paste prompt for Session 1. The kickoff prompt must: confirm project folder as `prior-auth-radar`, specify the auth system files to copy first (in order), reference the default credentials (admin / radar2026), note that mock mode requires no login and sandbox mode requires login, and reference all three prior POCs as pattern references — specifically calling out that the auth system copies from `patient-cost-clarity` and the parallel execution and mock-loader patterns copy from `claim-status-radar`.

---

*PRD Prompt v1.0 — Prior Authorization Intelligence Feed*
*Paul Lopez / Skygile Inc — February 2026*
*Stack reference: pauls-bootstrap.md*
*Brand reference: paul-lopez-brand-card.md*
*Voice reference: myVoice.md*
*Business context: paul-lopez-career-transition-master-plan.md*
*Reference implementations: optum-real-eligibility-starter (POC 7), patient-cost-clarity (POC 4), claim-status-radar (POC 5)*
*CLAUDE.md reference: patient-cost-clarity/CLAUDE.md (auth patterns) + claim-status-radar/CLAUDE.md (dashboard patterns)*
*API reference: developer.optum.com/optumreal-medical/reference*
*Regulatory reference: CMS Prior Authorization Final Rule (CMS-0057-F), effective January 2026*
