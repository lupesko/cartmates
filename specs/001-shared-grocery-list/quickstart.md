# Quickstart and Validation: Shared Grocery List

**Date**: 2026-11-06  
**Purpose**: Planned local setup, validation, and deployment workflow for the CartMates MVP.

This document describes the commands and checks the implementation must support. It does not imply
that source code or package scripts exist before the implementation phase.

## Prerequisites

- Node.js 24 LTS and npm
- A Cloudflare account with Pages, Workers, and Durable Objects available
- Wrangler authenticated to the intended Cloudflare account for deployment
- A Google OAuth web client with localhost and deployed callback URLs registered
- Two Google accounts for end-to-end checks: one allowlisted and one not allowlisted

## Configuration

1. Install the exact committed dependencies:

   ```sh
   npm ci
   ```

2. Copy the safe example configuration and keep the working file out of Git:

   ```sh
   cp .dev.vars.example .dev.vars
   ```

3. Set local values for:

   | Name | Secret | Example / purpose |
   |------|--------|-------------------|
   | `APP_ORIGIN` | No | `http://localhost:8788` |
   | `GROUP_DISPLAY_NAME` | No | `Our Groceries` |
   | `GOOGLE_CLIENT_ID` | No | Google OAuth client identifier |
   | `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
   | `ALLOWED_EMAILS` | Yes | Static comma-separated normalized email allowlist |
   | `SESSION_ENCRYPTION_KEY` | Yes | Strong random key material for encrypted sessions |

   The callback URL is `${APP_ORIGIN}/api/auth/callback`. The initial production origin may be
   `https://shopping.lupesko.com`, but reusable logic must derive it from configuration.

4. Never place real secrets in `.dev.vars.example`, Wrangler configuration, client-prefixed
   variables, generated frontend files, logs, screenshots, tests, or Git.

## Run Locally

Use two terminals because Pages cannot define the external Durable Object class directly.

Terminal 1 — private state Worker:

```sh
npm run dev:state
```

Terminal 2 — Vite build/watch plus Pages and same-origin Functions:

```sh
npm run dev:pages
```

The Pages development command binds `LIST` to `SharedList` in the local state Worker. Open the
displayed Pages URL, not the state Worker's internal address.

## Automated Quality Gate

The following commands must all pass locally and in GitHub Actions:

```sh
npm run lint
npm run typecheck
npm run test
npm run test:workers
npm run build
npm run test:e2e
```

The test suites must remain deterministic and must not require production credentials or data.
Worker tests use isolated local Durable Object storage. Browser tests use controlled authentication
fixtures except for a separate opt-in real-Google smoke test.

## MVP Validation Scenarios

### 1. Authentication and authorization

1. Visit the app signed out and verify no list data or API response is available.
2. Sign in with an allowlisted, verified Google account and verify the list appears.
3. Refresh and verify the session persists; sign out and verify access ends.
4. Attempt sign-in with an unlisted account and verify a friendly denial with no list disclosure.
5. Call every protected endpoint without a session, after allowlist removal, with a wrong Origin,
   and with a missing/incorrect CSRF token; verify rejection.
6. Inspect browser storage and built assets: Google tokens and server secrets must never appear.

### 2. Core list behavior and attribution

1. Add `Milk` by Enter and by tapping Add; verify trimmed text, input clearing, count, and
   `Added by <authenticated display name>`.
2. Reject empty, whitespace-only, multiline, and over-200-character input with clear feedback.
3. Add `Eggs` twice; buy or remove one occurrence and verify only its stable ID disappears.
4. Have a second user add an identical item and verify each record retains the correct creator.
5. Verify either user can buy or remove any item regardless of creator.
6. Cancel Clear and Mark All confirmations; then confirm each and verify one atomic transition.
7. Repeat Clear and Mark All on an empty list and verify a safe successful no-op.

### 3. Concurrency, retry safety, and persistence

1. Open two independent authorized browser contexts.
2. Add different items simultaneously; verify both survive and all clients converge.
3. Race Clear against Add; verify the result matches one serialized order and no committed later
   addition is lost.
4. Submit the same mutation twice with the same idempotency key; verify it applies once.
5. Reuse that key with a different payload; verify `409 idempotency_conflict` and no mutation.
6. Delay and retry a completed Clear after adding a new item; verify the new item remains.
7. Restart the local state Worker and Pages processes; verify active items and attribution remain.
8. Confirm mutation responses and polling ETags carry monotonically increasing revisions.

### 4. Synchronization and failure recovery

1. Change the list in one active context and verify another updates within five seconds.
2. Verify polling requests do not overlap, pause while the document is hidden, and refresh on
   visibility, focus, and connectivity restoration.
3. Simulate an offline or failed mutation. Verify the UI preserves truthful state, announces the
   failure, retains recoverable input where relevant, and offers retry.
4. Verify no destructive action is displayed as successful before backend confirmation.

### 5. Responsive UI and accessibility

1. Exercise the sign-in, populated list, empty list, menu, pending, error, and confirmation states
   at 320, 390, 768, and 1440 CSS-pixel widths.
2. Compare app-only Playwright snapshots with the reviewed baselines derived from the supplied
   mockup and assets; do not reproduce the mockup's phone hardware chrome.
3. Complete every action by keyboard. Verify visible focus, logical order, menu semantics, dialog
   focus containment, Escape/cancel behavior, and focus restoration.
4. Run automated axe checks and verify controls have accessible names and status/error changes are
   announced without unexpected focus movement.
5. Manually verify a current screen reader, 200% and 400% zoom/reflow, reduced motion, touch-only
   use, and 44-by-44 CSS-pixel minimum targets.
6. Verify the production initial JavaScript is at or below 150 KiB gzip, excluding images.

## Production Configuration and Deployment

Use separate Cloudflare resources and secrets for preview and production.

1. Create/deploy the SQLite-backed Durable Object namespace and private state Worker first:

   ```sh
   npm run deploy:state
   ```

2. Configure Pages variables and encrypted secrets through Cloudflare, including the external
   Durable Object binding. Do not commit their values.
3. Build and deploy Pages second:

   ```sh
   npm run build
   npm run deploy:pages
   ```

4. Register the exact deployed callback with Google and attach the configured custom domain.
5. Run smoke checks for allowlisted login, denied login, one mutation, polling, sign-out, security
   headers, and persistence after a Worker redeployment.

Deployment automation must stop if lint, strict type checking, tests, accessibility checks, bundle
budget, or build fails. Rollback must deploy a previously known-good state Worker and Pages build
without deleting or replacing the Durable Object namespace.

## Contract References

- [Data model and transitions](data-model.md)
- [OpenAPI contract](contracts/openapi.yaml)
- [Architecture decisions and sources](research.md)

