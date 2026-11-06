# Implementation Plan: Shared Grocery List

**Branch**: `001-shared-grocery-list` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-shared-grocery-list/spec.md`

## Summary

Build CartMates as one mobile-first React single-page application on Cloudflare Pages with
same-origin Pages Functions for Google OpenID Connect, allowlist authorization, secure sessions,
CSRF protection, and a small JSON API. Bind the Pages project directly to a private companion Worker
that defines one `SharedList` Durable Object per deployment. The Durable Object serializes every
mutation and persists a human-readable NDJSON document plus idempotency receipts through the
transactional key-value API of its mandatory SQLite-backed storage. Clients reconcile from
authoritative mutation responses and three-second conditional polling. The supplied visual assets
and plain CSS provide the approved responsive, accessible experience without a UI framework.

## Technical Context

**Language/Version**: TypeScript 5.9.x in strict mode; React 19.3; Node.js 24 LTS for tooling and CI;
Cloudflare Workers compatibility date `2026-11-06`

**Primary Dependencies**: React, React DOM, Vite 8.x, `jose` 6.x, Wrangler; development-only ESLint,
Vitest 4.1+, `@cloudflare/vitest-plugin`, React Testing Library, Playwright, and
`@axe-core/playwright`

**Storage**: One named SQLite-backed Cloudflare Durable Object using its synchronous transactional
key-value API; `state/document` is NDJSON and `operation/*` values are minimal idempotency receipts;
no SQL schema, relational database, ORM, Workers KV, R2, or in-memory authoritative state

**Testing**: Vitest unit tests; React Testing Library component tests; Cloudflare Vitest runtime and
integration tests; Playwright multi-user end-to-end, responsive, visual, keyboard/focus, and axe
accessibility tests; manual screen-reader, zoom/reflow, reduced-motion, and touch validation

**Target Platform**: Modern phone, tablet, and desktop browsers; Cloudflare Pages and Pages
Functions; private Cloudflare Worker/Durable Object; local development through Wrangler

**Project Type**: Web application with a client SPA, same-origin backend-for-frontend, and one private
state Worker in a single repository and package

**Performance Goals**: Visible input acknowledgment within one second; committed remote changes
visible to active peers within five seconds; three-second non-overlapping conditional polling; total
initial JavaScript at or below 150 KiB gzip excluding images; no clipped or blocked core action at
320, 390, 768, or 1440 CSS-pixel viewport widths

**Constraints**: WCAG 2.2 AA; 44-by-44 CSS-pixel touch targets; Google Authorization Code OIDC with
PKCE; static allowlist on every protected request; fixed 24-hour encrypted session; explicit CSRF
defense; serialized atomic durable mutations; retry-safe list-wide actions; one group and list per
deployment; 200-character item limit; automatic updates through polling; no offline editing,
analytics, advertising, WebSockets, database/ORM, user administration, or purchase history

**Scale/Scope**: One trusted household, flat, office, or similar group per deployment; one ordered
active list coordinated by one Durable Object; 11 user stories, 80 functional requirements, and 20
success criteria; household-scale traffic where correctness and simplicity outrank horizontal
throughput

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Gate | Pre-Design | Post-Design | Evidence |
|------------------|------------|-------------|----------|
| I. Simplicity First | PASS | PASS | One SPA, one package, plain CSS, file-routed Functions, one state object, no router/state/UI/data framework, and no speculative features. |
| II. Security by Default | PASS | PASS | Google OIDC code flow with PKCE/state/nonce; server-side ID-token validation, allowlist authorization, encrypted host-only cookies, CSRF checks, server-derived creator names, secret bindings, and no sensitive logs. |
| III. Data Correctness and Concurrency | PASS | PASS | One Durable Object is the serialization boundary; state and idempotency receipt commit atomically before response; no authoritative in-memory state; item IDs protect duplicates. |
| IV. Mobile-First, Engaging UI/UX | PASS | PASS | Supplied design assets, phone-first layout, live feedback, responsive viewports, 44 px targets, semantic controls, focus management, reduced motion, and WCAG tests. |
| V. Open-Source Quality and Community | PASS | PASS | MIT distribution, strict TypeScript, README/CONTRIBUTING/CODE_OF_CONDUCT, example configuration, architecture documentation, tests, and GitHub Actions are planned deliverables. |
| VI. Cloudflare-Native Architecture | PASS | PASS | Pages hosts the SPA; Pages Functions are the BFF; an external SQLite-backed Durable Object Worker provides native coordination/storage; Wrangler covers local development and reproducible deployment. |
| VII. Testing and Reliability | PASS | PASS | Unit, component, runtime, integration, concurrency, restart, retry, API, browser, accessibility, and visual validation are explicit; CI gates lint/typecheck/tests/build. |
| VIII. Performance and Responsiveness | PASS | PASS | Small dependency set, 150 KiB gzip budget, conditional three-second polling, no real-time infrastructure, and immediate pending feedback. |
| IX. Privacy and Minimal Data Collection | PASS | PASS | Only required identity claims, active items, and content-free operation receipts persist; no analytics/tracking; protected no-store responses and privacy-conscious logs. |
| X. Maintainability and Future Evolution | PASS | PASS | UI, API/auth, shared contracts, and state coordination have explicit boundaries without extra services or extension points; configuration is externalized. |
| Required quality workflow | PASS | PASS | Plan covers threat assumptions, authorization, consistency, accessibility, Cloudflare behavior, self-hosting, documentation, CI, restart/redeploy, and rollback verification. |

Cloudflare requires all new Durable Object namespaces to use its SQLite storage backend. This does
not introduce an application relational model: the design deliberately uses only the supported
key-value interface with one NDJSON list document and no SQL tables or ORM. It therefore satisfies
the constitution's simple persistence requirement without an exception.

## Project Structure

### Documentation (this feature)

```text
specs/001-shared-grocery-list/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
├── checklists/
│   └── requirements.md
├── assets/
│   └── cartmates-ui-assets/
└── tasks.md                  # Generated later by $speckit-tasks
```

### Source Code (repository root)

```text
.
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── functions/
│   ├── _lib/
│   │   ├── auth.ts
│   │   ├── cookies.ts
│   │   ├── csrf.ts
│   │   ├── errors.ts
│   │   ├── headers.ts
│   │   └── list-binding.ts
│   └── api/
│       ├── auth/
│       │   ├── login.ts
│       │   ├── callback.ts
│       │   └── logout.ts
│       ├── session.ts
│       ├── list/
│       │   ├── index.ts
│       │   ├── clear.ts
│       │   └── mark-all-bought.ts
│       └── items/
│           ├── index.ts
│           └── [id]/
│               ├── index.ts
│               └── bought.ts
├── public/
│   ├── _headers
│   ├── _routes.json
│   └── assets/               # Approved CartMates runtime assets
├── shared/
│   ├── api-contracts.ts
│   ├── list-document.ts
│   └── validation.ts
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── state.ts
│   ├── components/
│   │   ├── AuthScreen.tsx
│   │   ├── ShoppingList.tsx
│   │   ├── GroceryItemRow.tsx
│   │   ├── AddItemForm.tsx
│   │   ├── ItemActionsMenu.tsx
│   │   ├── ConfirmationDialog.tsx
│   │   ├── EmptyState.tsx
│   │   └── StatusMessage.tsx
│   ├── hooks/
│   │   └── useSharedList.ts
│   ├── lib/
│   │   └── api-client.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   └── app.css
│   └── main.tsx
├── state-worker/
│   ├── index.ts
│   ├── shared-list.ts
│   └── storage.ts
├── tests/
│   ├── unit/
│   ├── components/
│   ├── workers/
│   ├── contract/
│   └── e2e/
├── .dev.vars.example
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.worker.json
├── vite.config.ts
├── vitest.config.ts
├── vitest.worker.config.ts
├── wrangler.pages.jsonc
└── wrangler.state.jsonc
```

**Structure Decision**: Use one repository-level TypeScript package to minimize configuration and
dependency duplication. The browser code lives in `src/`; same-origin Pages Functions live in
`functions/`; the separately deployed but non-public Durable Object class lives in `state-worker/`;
and only safe wire types, validation, and NDJSON codecs live in `shared/`. Server secrets and auth
helpers never enter frontend-importable modules. Tests mirror runtime boundaries without creating
separate packages.

## Phase 0: Research Outcome

All technical unknowns are resolved in [research.md](research.md). The design uses current supported
Cloudflare, Google OIDC, React/Vite, Workers testing, and Playwright patterns. No clarification
markers remain.

## Phase 1: Design Outputs

- [data-model.md](data-model.md) defines list, item, session, OAuth transaction, mutation, operation
  receipt, persisted NDJSON, validation, and state transitions.
- [contracts/openapi.yaml](contracts/openapi.yaml) defines the same-origin public HTTP contract,
  authorization, CSRF, idempotency, structured errors, and authoritative list responses.
- [quickstart.md](quickstart.md) defines local setup and runnable validation for authentication,
  authorization, core mutations, concurrency, restart persistence, retry safety, responsive UI,
  accessibility, and production build/deployment readiness.

No constitution violations or complexity exceptions remain after Phase 1 design.
