---
description: "Dependency-ordered implementation tasks for the CartMates shared grocery list"
---

# Tasks: Shared Grocery List

**Input**: Design documents from `specs/001-shared-grocery-list/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`,
`quickstart.md`, and the CartMates visual asset pack

**Tests**: Tests are mandatory because the specification and constitution explicitly require
coverage of core behavior, authentication, authorization, concurrency, retries, persistence,
invalid input, accessibility, and independent API behavior. Within each story, write the listed
tests first and confirm they fail for the expected missing behavior before implementation.

**Organization**: Tasks are grouped by user story so each increment has a clear goal and an
independent acceptance check. Exact source paths follow the approved single-package structure.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its phase prerequisites because it affects different files and
  does not depend on another incomplete task in the same parallel group.
- **[Story]**: Maps the task to a user story from `spec.md`.
- Setup, foundational, and polish tasks intentionally have no story label.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the minimal React, TypeScript, Cloudflare, and test toolchain described by the
plan without adding a router, state library, UI framework, CSS framework, ORM, or database client.

- [X] T001 Initialize `package.json` and `package-lock.json` with Node 24, React 19.3, Vite 8, TypeScript 5.9, jose 6, Wrangler, ESLint, Vitest 4.1, Cloudflare Vitest plugin, React Testing Library, Playwright, and axe dependencies plus the scripts named in `quickstart.md`
- [X] T002 Configure strict TypeScript project references with `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` in `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.worker.json`
- [X] T003 [P] Configure browser building and local development in `vite.config.ts` and create the semantic application entry points in `index.html` and `src/main.tsx`
- [X] T004 [P] Configure lint rules for browser, Pages Functions, Worker, and test code in `eslint.config.js`
- [X] T005 [P] Configure pure and jsdom test projects in `vitest.config.ts` and shared DOM setup in `tests/setup/dom.ts`
- [X] T006 [P] Configure Cloudflare runtime tests for Pages Functions and Durable Objects in `vitest.worker.config.ts`
- [X] T007 [P] Configure Chromium browser, mobile and desktop projects, trace retention, and stable visual snapshots in `playwright.config.ts`
- [X] T008 Configure the Cloudflare Pages project, external `LIST` Durable Object binding, and compatibility date in the standard Pages configuration `wrangler.jsonc`
- [X] T009 Configure the private state Worker, SQLite-backed `SharedList` Durable Object migration, and no public routes in `wrangler.state.jsonc`
- [X] T010 Copy the approved runtime asset tree from `specs/001-shared-grocery-list/assets/cartmates-ui-assets/public/assets/` into `public/assets/` without altering Google branding assets
- [X] T011 [P] Add safe ignored local configuration and placeholder-only examples for `APP_ORIGIN`, `GROUP_DISPLAY_NAME`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAILS`, and `SESSION_ENCRYPTION_KEY` in `.gitignore` and `.dev.vars.example`
- [X] T012 [P] Configure Pages routing and baseline security headers without caching protected API responses in `public/_routes.json` and `public/_headers`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared contracts, strict validation, durable NDJSON storage, idempotent
transactions, protected handler primitives, and client state/error foundations used by every story.

**Critical**: No user-story implementation begins until this phase passes its unit and Worker tests.

### Foundational Tests

- [X] T013 [P] Write failing unit tests for strict NDJSON parsing, empty-state creation, schema version 1, non-negative revisions, ordered items, duplicate-ID rejection, and round-trip serialization in `tests/unit/list-document.test.ts`
- [X] T014 [P] Write failing unit tests for UUIDs, normalized emails, local return paths, idempotency keys, item trimming, exactly 200 accepted characters, 201 rejected characters, CR/LF rejection, disallowed control rejection, and valid Unicode in `tests/unit/validation.test.ts`
- [X] T015 [P] Write failing Worker tests proving a mutation transaction atomically stores `state/document` and its receipt, replays a matching receipt without mutation, and rejects a mismatched fingerprint in `tests/workers/mutation-transaction.test.ts`

### Foundational Implementation

- [X] T016 Define shared wire contracts for `GroceryItem`, `ShoppingList`, `ListResponse`, `MutationCommand`, `MutationResponse`, `SessionResponse`, and structured `{ error: { code, message, retryable } }` errors in `shared/api-contracts.ts`
- [X] T017 Implement shared server-safe validation in `shared/validation.ts`, preserving these constraints verbatim: item `id` is a required unique immutable backend-generated UUID; `text` is required, trimmed, 1–200 characters, contains no CR/LF or disallowed control characters, and permits duplicates; `creatorName` is required, non-empty, server-derived, and immutable
- [X] T018 Implement strict human-readable NDJSON codecs for one metadata record followed by ordered item records, treating missing state as schema version 1 revision 0 and rejecting corruption without repair in `shared/list-document.ts`
- [X] T019 [P] Define typed Pages and Worker bindings plus validated configuration access with `GROUP_DISPLAY_NAME` defaulting to `Our Groceries` in `functions/_lib/env.ts` and `state-worker/env.ts`
- [X] T020 [P] Implement privacy-safe structured error mapping, random request IDs, and logs limited to event type, coarse outcome, status, and duration in `functions/_lib/errors.ts` and `functions/_lib/logging.ts`
- [X] T021 [P] Implement no-store JSON/redirect response helpers and CSP, frame-ancestors, referrer-policy, and nosniff headers in `functions/_lib/headers.ts`
- [X] T022 Implement the named `shared-list-v1` Durable Object resolver and typed private RPC adapter in `functions/_lib/list-binding.ts`
- [X] T023 Implement durable `state/document` read/write through the SQLite-backed Durable Object synchronous KV interface without SQL tables, ORM, or authoritative memory state in `state-worker/storage.ts`
- [X] T024 Implement the generic atomic mutation runner that validates commands, scopes receipt keys as `operation/<actorSub>/<operationId>`, persists content-free receipts, increments revision for first-processed no-ops, returns current authoritative state on replay, and raises idempotency conflict on fingerprint mismatch in `state-worker/storage.ts`
- [X] T025 Export the private `SharedList` Durable Object class and typed RPC surface without a public HTTP route in `state-worker/index.ts` and `state-worker/shared-list.ts`
- [X] T026 [P] Implement the same-origin JSON API client with safe structured-error parsing, request cancellation, UUID idempotency keys, and no optimistic destructive commits in `src/lib/api-client.ts`
- [X] T027 [P] Define explicit signed-out, loading, ready, pending, recoverable-error, access-denied, and expired-session UI state transitions in `src/app/state.ts`
- [X] T028 [P] Create deterministic session, Google identity, Pages request, Durable Object, network-failure, and multi-user browser fixtures with no production credentials in `tests/fixtures/`

**Checkpoint**: Shared contracts compile, foundational tests pass in the actual Cloudflare runtime,
and no browser-importable module contains server configuration or secrets.

---

## Phase 3: User Story 1 — Sign In with Google (Priority: P1) — Security MVP

**Goal**: Allow only statically allowlisted, verified Google identities to establish a secure
24-hour CartMates session, survive refresh, read session presentation data, and sign out.

**Independent Test**: With controlled approved and unapproved Google identities, complete sign-in,
refresh, session lookup, allowlist removal, protected-route access, and sign-out; only the currently
allowlisted identity can reach protected content and no provider token reaches browser storage.

### Tests for User Story 1

- [X] T029 [P] [US1] Write failing unit tests for PKCE S256, state, nonce, exact allowlist normalization, session claim validation, fixed 24-hour expiry, and 10-minute OAuth transaction expiry in `tests/unit/auth.test.ts`
- [X] T030 [P] [US1] Write failing contract tests for `/api/auth/login`, `/api/auth/callback`, `/api/session`, and `/api/auth/logout`, including exact redirects, safe errors, cookie flags, no-store, logout CSRF, and OpenAPI response shapes in `tests/contract/auth.contract.test.ts`
- [X] T031 [P] [US1] Write failing Worker integration tests for issuer/audience/azp/signature/expiry/iat/nonce/email/email_verified/name validation, one-time transaction consumption, exact allowlist checks on every request, and rejection of missing sessions in `tests/workers/auth.integration.test.ts`
- [X] T032 [P] [US1] Write failing component tests for the sign-in, loading, access-denied, expired-session, and sign-out states in `tests/components/auth-screen.test.tsx`
- [X] T033 [P] [US1] Write a failing browser journey covering approved login fixtures, refresh continuity, unapproved denial, sign-out, and direct protected API rejection in `tests/e2e/auth.spec.ts`

### Implementation for User Story 1

- [X] T034 [US1] Implement AES-GCM JWE OAuth and session cookie encode/decode/clear helpers with `__Host-` naming, Secure, HttpOnly, correct SameSite, Path `/`, no Domain, explicit Max-Age, version 1 claims, non-empty `sub`/email/name/csrf, and validated `iat`/`exp` in `functions/_lib/cookies.ts`
- [X] T035 [US1] Implement Google discovery/JWKS ID-token verification, authorization-code exchange with PKCE, exact email normalization/allowlist authorization, and provider-token disposal in `functions/_lib/auth.ts`
- [X] T036 [US1] Implement exact-Origin and constant-time `X-CSRF-Token` enforcement for all state-changing handlers, including logout, in `functions/_lib/csrf.ts`
- [X] T037 [US1] Implement local-return-path validation and Google Authorization Code + PKCE S256 login initiation with state and nonce in `functions/api/auth/login.ts`
- [X] T038 [US1] Implement one-time callback validation, code exchange, verified-claim enforcement, friendly access denial, and session issuance in `functions/api/auth/callback.ts`
- [X] T039 [US1] Implement current-session presentation with initials and per-request allowlist reauthorization in `functions/api/session.ts`
- [X] T040 [US1] Implement CSRF-protected local session termination without revoking Google consent in `functions/api/auth/logout.ts`
- [X] T041 [US1] Build the live-text branded authentication UI and session bootstrap/sign-out integration in `src/components/AuthScreen.tsx` and `src/app/App.tsx`

**Checkpoint**: User Story 1 passes independently; unauthorized identities and direct unauthenticated
API calls reveal no list, allowlist, token, secret, or sensitive diagnostic data.

---

## Phase 4: User Story 2 — View the Shared List (Priority: P1)

**Goal**: Show every authorized member the same durable active list, remaining count, and friendly
empty state, with automatic visibility of remote changes within five seconds.

**Independent Test**: Open two authorized contexts, verify matching empty or populated state and
count, mutate the backing fixture, observe the second context update automatically, then restart the
state runtime and verify the acknowledged state remains.

### Tests for User Story 2

- [X] T042 [P] [US2] Write failing Worker tests for missing-document empty state, persisted NDJSON reads after Durable Object recreation, one shared named object, revision ETags, and unauthorized read rejection in `tests/workers/list-read.test.ts`
- [X] T043 [P] [US2] Write failing contract tests for `GET /api/list` 200/304/401/403/503 responses, `ListResponse`, `remainingCount === items.length`, ETag, and no-store headers in `tests/contract/list-read.contract.test.ts`
- [X] T044 [P] [US2] Write failing unit tests for non-overlapping three-second polling, `If-None-Match`, abort cleanup, hidden-page pause, and focus/online refresh in `tests/unit/use-shared-list.test.ts`
- [X] T045 [P] [US2] Write failing component tests for loading, ordered item rendering, accurate count, empty state, polling failure, and recovery in `tests/components/shopping-list.test.tsx`

### Implementation for User Story 2

- [X] T046 [US2] Implement `getList` Durable Object RPC returning strictly parsed durable state and revision in `state-worker/shared-list.ts`
- [X] T047 [US2] Implement authenticated `GET /api/list` with group name, derived count, quoted revision ETag, 304 handling, no-store, and dependency-safe structured failures in `functions/api/list/index.ts`
- [X] T048 [US2] Extend the API client with conditional authoritative list reads in `src/lib/api-client.ts`
- [X] T049 [US2] Implement sequential three-second polling that pauses while hidden and refreshes on focus or online events in `src/hooks/useSharedList.ts`
- [X] T050 [US2] Build and integrate ordered list, remaining count, loading, empty, connectivity, and retry presentation in `src/components/ShoppingList.tsx`, `src/components/EmptyState.tsx`, `src/components/StatusMessage.tsx`, and `src/app/App.tsx`

**Checkpoint**: User Story 2 passes independently with protected, durable reads and automatic
convergence under normal connectivity.

---

## Phase 5: User Story 3 — Add Items (Priority: P1)

**Goal**: Add trimmed, valid, duplicate-friendly items by Enter or touch, using a backend-generated
identity and authenticated creator, clearing input only after durable confirmation.

**Independent Test**: Add normal, duplicate, Unicode, whitespace-padded, empty, multiline,
200-character, and 201-character values by keyboard and touch; verify exact validation, stable IDs,
authoritative count, retained failed input, and cleared successful input.

### Tests for User Story 3

- [X] T051 [P] [US3] Write failing state-transition tests for append ordering, backend UUID generation, duplicate text, immutable creator snapshots, revision increments, and no stored quantity/category/time/history fields in `tests/unit/add-item.test.ts`
- [X] T052 [P] [US3] Write failing contract and Worker tests for `POST /api/items`, required JSON/CSRF/idempotency headers, text-only request bodies, server-derived actor identity, exact input boundaries, durable response-before-success, and replay behavior in `tests/contract/add-item.contract.test.ts` and `tests/workers/add-item.test.ts`
- [X] T053 [P] [US3] Write failing component tests for Enter/Add submission, immediate pending feedback, double-submit prevention, successful clearing, validation messages, and failed-request input retention in `tests/components/add-item-form.test.tsx`

### Implementation for User Story 3

- [X] T054 [US3] Implement the pure add transition with backend UUID generation and append semantics in `shared/list-state.ts`
- [X] T055 [US3] Implement `add` Durable Object RPC so each `GroceryItem` has a required unique immutable backend-generated UUID, required trimmed 1–200 character single-line text with duplicates allowed, and a required non-empty immutable creator name derived only from the authenticated session in `state-worker/shared-list.ts`
- [X] T056 [US3] Implement authenticated, JSON-only, CSRF- and idempotency-protected `POST /api/items` accepting only `{ text }` and forwarding trusted `actorSub` and `actorName` in `functions/api/items/index.ts`
- [X] T057 [US3] Extend mutation requests to preserve one UUID idempotency key across uncertain retries and replace local state only with authoritative responses in `src/lib/api-client.ts` and `src/hooks/useSharedList.ts`
- [X] T058 [US3] Build the accessible add form with a live character boundary, Enter and touch submission, retained failed input, and authoritative-success clearing in `src/components/AddItemForm.tsx`
- [X] T059 [US3] Integrate the add form directly into the primary list view and update count/items from confirmed responses in `src/components/ShoppingList.tsx`
- [X] T060 [US3] Add the two-context browser journey for valid, invalid, duplicate, and automatically synchronized additions in `tests/e2e/add-item.spec.ts`

**Checkpoint**: User Story 3 passes independently; duplicates are distinct and no creator identity
or durable success is trusted from client input.

---

## Phase 6: User Story 4 — See Who Added Each Item (Priority: P1)

**Goal**: Display the immutable authenticated creator beneath every item without creating ownership,
profiles, directories, or differentiated permissions.

**Independent Test**: Two identities add identical and different items, including long and
non-Latin creator names; every viewer sees the correct `Added by {name}`, forged client attribution
is ignored, restart preserves labels, and either member can act on either item.

### Tests for User Story 4

- [X] T061 [P] [US4] Write failing Worker tests for forged `creatorName` rejection, missing trusted display-name failure, immutable attribution after later sessions, two-user simultaneous attribution, and restart preservation in `tests/workers/creator-attribution.test.ts`
- [X] T062 [P] [US4] Write failing component tests for exact `Added by {display name}` live text, visually secondary semantics, long/non-Latin wrapping, duplicate attribution, and no ownership controls in `tests/components/grocery-item-row.test.tsx`
- [X] T063 [P] [US4] Write a failing two-user browser journey for correct attribution, duplicate independence, restart persistence, and equal permissions in `tests/e2e/creator-attribution.spec.ts`

### Implementation for User Story 4

- [X] T064 [US4] Harden add-command decoding so client `creatorName`, `actorName`, `actorSub`, IDs, and unknown fields cannot override server session identity in `functions/api/items/index.ts` and `state-worker/shared-list.ts`
- [X] T065 [US4] Build the item row with item text and exact live `Added by {creatorName}` secondary label in `src/components/GroceryItemRow.tsx`
- [X] T066 [US4] Add readable muted creator styling that supports Unicode, long names, zoom/reflow, and duplicates without hiding meaning in `src/styles/app.css`

**Checkpoint**: User Story 4 passes independently; attribution is durable context only and never an
authorization or ownership mechanism.

---

## Phase 7: User Story 5 — Mark One Item as Bought (Priority: P1)

**Goal**: Remove exactly one item by stable ID through an immediately discoverable touch-friendly
bought control, only after durable confirmation, without retaining bought history.

**Independent Test**: Add two duplicate items, mark one bought, and verify only the selected ID is
removed, count decreases, no history exists, and a stale repeated action returns safely.

### Tests for User Story 5

- [X] T067 [P] [US5] Write failing unit and Worker tests for mark-bought-by-ID, duplicate safety, `already_absent`, revision behavior, idempotent retry, and absence of bought/history records in `tests/unit/mark-bought.test.ts` and `tests/workers/mark-bought.test.ts`
- [X] T068 [P] [US5] Write failing contract tests for authenticated, CSRF- and idempotency-protected `POST /api/items/{itemId}/bought` including invalid UUID, authoritative response, 401/403/409/503, and stale-item outcomes in `tests/contract/mark-bought.contract.test.ts`
- [X] T069 [P] [US5] Write failing component tests for the labelled 44-by-44 CSS-pixel bought control, pending/disabled feedback, confirmed removal, failure restoration, and duplicate targeting in `tests/components/mark-bought.test.tsx`

### Implementation for User Story 5

- [X] T070 [US5] Implement mark-bought removal by exact immutable item ID with `applied` or `already_absent` outcome and no history in `shared/list-state.ts` and `state-worker/shared-list.ts`
- [X] T071 [US5] Implement protected `POST /api/items/{itemId}/bought` with UUID validation and authoritative mutation response in `functions/api/items/[id]/bought.ts`
- [X] T072 [US5] Connect the item-row bought control to confirmed state reconciliation and accessible pending/error feedback in `src/components/GroceryItemRow.tsx` and `src/hooks/useSharedList.ts`

**Checkpoint**: User Story 5 passes independently; buying one duplicate never removes another and
no purchase history or recoverable archive is created.

---

## Phase 8: User Story 6 — Remove One Item (Priority: P1)

**Goal**: Let any authorized member remove exactly one selected item, including duplicates, while a
stale removal remains a safe no-op.

**Independent Test**: Remove one unique and one duplicate item, repeat after another member already
removed the same ID, and verify no unrelated item or attribution changes.

### Tests for User Story 6

- [X] T073 [P] [US6] Write failing Worker tests for exact-ID removal, duplicate preservation, any-member permission, `already_absent`, replay safety, and no archive in `tests/workers/remove-item.test.ts`
- [X] T074 [P] [US6] Write failing contract tests for authenticated, CSRF- and idempotency-protected `DELETE /api/items/{itemId}` including invalid UUID, 401/403/409/503, and authoritative stale results in `tests/contract/remove-item.contract.test.ts`
- [X] T075 [P] [US6] Write failing component tests for opening the item actions menu, labelled Remove activation, keyboard/Escape behavior, pending feedback, focus restoration, and failure recovery in `tests/components/item-actions-menu.test.tsx`

### Implementation for User Story 6

- [X] T076 [US6] Implement remove-by-ID with `applied` or `already_absent` and no history/archive in `shared/list-state.ts` and `state-worker/shared-list.ts`
- [X] T077 [US6] Implement protected `DELETE /api/items/{itemId}` with UUID validation and authoritative mutation response in `functions/api/items/[id]/index.ts`
- [X] T078 [US6] Build and integrate the accessible item-actions menu and confirmed Remove flow in `src/components/ItemActionsMenu.tsx`, `src/components/GroceryItemRow.tsx`, and `src/hooks/useSharedList.ts`

**Checkpoint**: User Story 6 passes independently; stale or duplicate-name removal cannot damage a
different list entry.

---

## Phase 9: User Story 7 — Clear the Entire List (Priority: P1)

**Goal**: Atomically clear all then-active items only after explicit confirmation, including a safe
empty-list no-op and safe retry after response loss.

**Independent Test**: Open Clear confirmation, cancel without change, confirm a populated list,
repeat on empty, then retry the original request after a later add and verify the later item remains.

### Tests for User Story 7

- [X] T079 [P] [US7] Write failing Worker tests for one atomic Clear transition, `already_empty`, revision increment, receipt persistence, replay after a later add, and no partial state in `tests/workers/clear-list.test.ts`
- [X] T080 [P] [US7] Write failing contract tests for authenticated, CSRF- and idempotency-protected `POST /api/list/clear` with authoritative 200, 401/403/409/503, no-op, and retry responses in `tests/contract/clear-list.contract.test.ts`
- [X] T081 [P] [US7] Write failing component tests for Clear open/cancel/close/confirm, live item count, destructive labeling, focus trap/restore, pending lockout, and failure recovery in `tests/components/clear-list.test.tsx`

### Implementation for User Story 7

- [X] T082 [US7] Implement atomic Clear with `applied` or `already_empty`, a first-processing revision increment, and no item archive in `shared/list-state.ts` and `state-worker/shared-list.ts`
- [X] T083 [US7] Implement protected `POST /api/list/clear` returning the authoritative list and replay metadata in `functions/api/list/clear.ts`
- [X] T084 [US7] Build a reusable accessible confirmation dialog/bottom sheet with labelled close, cancel, confirm, focus containment, and restoration in `src/components/ConfirmationDialog.tsx`
- [X] T085 [US7] Integrate the red Clear List action with live count copy, idempotent retry, pending, confirmed, and failed states in `src/components/ShoppingList.tsx` and `src/hooks/useSharedList.ts`

**Checkpoint**: User Story 7 passes independently; cancellation changes nothing and delayed retries
cannot clear items committed after the original operation.

---

## Phase 10: User Story 8 — Mark All Items as Bought (Priority: P1)

**Goal**: Atomically remove all active items through a semantically distinct confirmed completion
action while retaining no purchase history.

**Independent Test**: Cancel and confirm Mark All on populated and empty lists, verify its final
state equals Clear, and confirm no bought history exists or later post-operation additions disappear.

### Tests for User Story 8

- [X] T086 [P] [US8] Write failing Worker tests for atomic Mark All, `already_empty`, semantic operation receipts distinct from Clear, no history, and replay after later additions in `tests/workers/mark-all-bought.test.ts`
- [X] T087 [P] [US8] Write failing contract tests for authenticated, CSRF- and idempotency-protected `POST /api/list/mark-all-bought` across authoritative 200, 401/403/409/503, empty, and retry responses in `tests/contract/mark-all-bought.contract.test.ts`
- [X] T088 [P] [US8] Write failing component tests for the green Mark All action and bottom-sheet open/cancel/close/confirm behavior with completion illustration, live count, focus, pending, and error states in `tests/components/mark-all-bought.test.tsx`

### Implementation for User Story 8

- [X] T089 [US8] Implement atomic Mark All Bought with `applied` or `already_empty`, no history, and a distinct operation kind in `shared/list-state.ts` and `state-worker/shared-list.ts`
- [X] T090 [US8] Implement protected `POST /api/list/mark-all-bought` returning the authoritative list and replay metadata in `functions/api/list/mark-all-bought.ts`
- [X] T091 [US8] Integrate the green Mark All Bought action and approved completion illustration into the reusable confirmation flow in `src/components/ShoppingList.tsx` and `src/components/ConfirmationDialog.tsx`
- [X] T092 [US8] Add browser tests for Clear and Mark All cancellation, atomic success, empty no-op, retry, live-count copy, and no history in `tests/e2e/list-wide-actions.spec.ts`

**Checkpoint**: User Story 8 passes independently; its resulting list state matches Clear while its
copy and receipt preserve the user's semantic intent.

---

## Phase 11: User Story 9 — Collaborate Concurrently (Priority: P1)

**Goal**: Prove and harden one authoritative serialized order, no lost confirmed updates, durable
restart behavior, retry safety, and eventual convergence for simultaneous users.

**Independent Test**: Across separate authorized sessions, run simultaneous adds, Add/Clear races,
two actions on one ID, lost-response retries, and runtime restarts; every result must match a valid
serialized order, preserve attribution, and converge.

### Tests for User Story 9

- [X] T093 [P] [US9] Write a 100-trial Worker concurrency suite for two adds, Add versus Clear in both valid orders, and two operations on one ID, asserting no lost confirmed updates in `tests/workers/concurrency.test.ts`
- [X] T094 [P] [US9] Write a 100-trial Worker retry suite for Add, Bought, Remove, Clear, and Mark All, including mismatched-key conflicts and delayed destructive retries after new additions in `tests/workers/idempotency.test.ts`
- [X] T095 [P] [US9] Write a 20-cycle persistence suite that recreates Durable Object instances between acknowledged mutations and verifies item IDs, text, creator names, revisions, and receipts in `tests/workers/persistence.test.ts`
- [X] T096 [P] [US9] Write multi-context browser tests for simultaneous operations, remote convergence within five seconds, stale item actions, response loss, reconnect, and session expiry mid-mutation in `tests/e2e/collaboration.spec.ts`

### Implementation for User Story 9

- [X] T097 [US9] Audit and enforce one synchronous storage transaction per first-processed mutation so list document and receipt commit together before RPC success in `state-worker/storage.ts`
- [X] T098 [US9] Ensure all mutation RPC methods execute through the same serialized Durable Object command boundary and never cache authoritative state only in memory in `state-worker/shared-list.ts`
- [X] T099 [US9] Return the current authoritative document for exact retries while preserving the original outcome and `alreadyProcessed` metadata in `state-worker/storage.ts` and `shared/api-contracts.ts`
- [X] T100 [US9] Reconcile every confirmed mutation and reconnect from authoritative list responses while distinguishing pending, failed, and uncertain outcomes in `src/hooks/useSharedList.ts` and `src/app/state.ts`
- [X] T101 [US9] Add deterministic network-loss controls for before-send, after-commit-before-response, and reconnect conditions to `tests/fixtures/network.ts`
- [X] T102 [US9] Document the serialization boundary, NDJSON state, receipt retention, retry semantics, restart behavior, and rollback-safe namespace handling in `docs/architecture.md`

**Checkpoint**: User Story 9 passes its required 100-trial concurrency/retry and 20-cycle restart
checks with no invalid final state, lost confirmed update, mixed attribution, or repeated effect.

---

## Phase 12: User Story 10 — Shop with a Mobile-Friendly Experience (Priority: P1)

**Goal**: Deliver the approved delightful, lightweight, phone-first UI with complete accessible
states, comfortable touch controls, responsive layouts, purposeful motion, and desktop support.

**Independent Test**: Complete every core task at 320, 390, 768, and 1440 CSS-pixel widths by touch,
keyboard, and screen reader; verify app-only visual baselines, axe checks, reduced motion, reflow,
safe areas, slow/failing network feedback, and no device chrome.

### Tests for User Story 10

- [X] T103 [P] [US10] Write component accessibility tests for semantic landmarks, headings, live regions, accessible names/state, focus order, 44-by-44 CSS-pixel targets, validation association, and decorative-image exclusion in `tests/components/accessibility.test.tsx`
- [X] T104 [P] [US10] Write Playwright keyboard and axe tests for sign-in, list, add, bought, item menu, both confirmations, errors, and focus restoration in `tests/e2e/accessibility.spec.ts`
- [X] T105 [P] [US10] Write app-only visual snapshot tests at 320, 390, 768, and 1440 widths for sign-in, populated, empty, loading, error, menu, and both confirmation states in `tests/e2e/visual.spec.ts`
- [X] T106 [P] [US10] Write responsive interaction tests for safe-area insets, short viewport/virtual-keyboard conditions, long live text, 200%/400% reflow, touch-only flows, reduced motion, and missing decorative assets in `tests/e2e/responsive.spec.ts`

### Implementation for User Story 10

- [X] T107 [P] [US10] Translate the supplied palette, typography, radii, shadows, spacing, safe areas, dynamic viewport sizing, focus indicators, contrast, and reduced-motion tokens into `src/styles/tokens.css`
- [X] T108 [P] [US10] Implement the responsive page shell, scroll regions, live-text wrapping, phone/tablet/desktop breakpoints, short-viewport behavior, and 44-by-44 CSS-pixel controls in `src/styles/app.css`
- [X] T109 [US10] Refine the sign-in composition with supplied logo, mascot, Google mark, purpose statement, and decorative grocery footer while keeping live content unobscured in `src/components/AuthScreen.tsx`
- [X] T110 [US10] Refine the active-list hierarchy for brand header, user initials, group name, count, item cards, creator labels, add controls, and list-wide actions in `src/components/ShoppingList.tsx`
- [X] T111 [US10] Refine the accessible bottom-sheet confirmation presentation with supplied illustrations, live count, close/cancel/confirm actions, scroll lock, and focus management in `src/components/ConfirmationDialog.tsx`
- [X] T112 [US10] Implement friendly loading, empty, success, validation, connectivity, authorization, expired-session, and unexpected-error messaging with polite/assertive announcements as appropriate in `src/components/StatusMessage.tsx` and `src/components/EmptyState.tsx`
- [X] T113 [US10] Add subtle confirmed-removal and dialog transitions that never block input and are disabled by `prefers-reduced-motion` in `src/styles/app.css`
- [X] T114 [US10] Add favicon, app icons, maskable icons, and manifest metadata from the supplied pack without adding offline application behavior in `index.html` and `public/assets/app/manifest.webmanifest`
- [X] T115 [US10] Record reviewed app-only snapshot baselines, excluding phone hardware chrome and retaining live text, in `tests/e2e/visual.spec.ts-snapshots/`

**Checkpoint**: User Story 10 passes automated and manual WCAG 2.2 AA-oriented checks and remains
recognizably CartMates at every target viewport without sacrificing live, accessible content.

---

## Phase 13: User Story 11 — Configure One Group (Priority: P2)

**Goal**: Let operators configure one allowlist and display name outside the product while every
approved member shares the same list and equal permissions; default the name to `Our Groceries`.

**Independent Test**: Start instances with no display name, a custom name, multiple allowlisted
members, and removed members; verify correct name/default, one shared list, equal permissions,
immediate reauthorization, and no administration UI.

### Tests for User Story 11

- [X] T116 [P] [US11] Write failing configuration tests for the `Our Groceries` default, trimmed custom name, invalid empty custom name, exact normalized allowlist parsing, and secret-safe failures in `tests/unit/configuration.test.ts`
- [X] T117 [P] [US11] Write failing Worker/API tests for multiple allowlisted members sharing `shared-list-v1`, equal mutation permissions, immediate denial after allowlist removal, and no allowlist disclosure in `tests/workers/group-configuration.test.ts`
- [X] T118 [P] [US11] Write a failing browser test for default/custom display names, equal member permissions, and absence of group/invitation/role/admin controls in `tests/e2e/group-configuration.spec.ts`

### Implementation for User Story 11

- [X] T119 [US11] Finalize strict environment parsing for one external `LIST` binding, exact allowlist membership, and the non-empty `GROUP_DISPLAY_NAME` default `Our Groceries` in `functions/_lib/env.ts`
- [X] T120 [US11] Return the configured group name consistently from session and list endpoints without returning allowlist/configuration secrets in `functions/api/session.ts` and `functions/api/list/index.ts`
- [X] T121 [US11] Verify the UI consumes only returned group presentation data and exposes no membership, invitation, role, group creation, or administration controls in `src/app/App.tsx` and `src/components/ShoppingList.tsx`

**Checkpoint**: User Story 11 passes independently and every deployment remains exactly one
externally configured group with equal member permissions.

---

## Phase 14: Polish and Cross-Cutting Quality Gates

**Purpose**: Complete open-source, security, privacy, performance, deployment, and release evidence
that spans multiple stories without introducing new product behavior.

- [X] T122 [P] Add the project MIT license and preserve the separate CartMates asset-pack license notices in `LICENSE` and `NOTICE.md`
- [X] T123 [P] Write a welcoming operator README covering purpose, features, architecture, screenshots, prerequisites, installation, configuration, secret handling, stored information, local development, quality commands, deployment, custom domains, self-hosting, and rollback in `README.md`
- [X] T124 [P] Write contributor guidance covering issues, feature requests, setup, structure, conventions, branches, pull requests, lint/typecheck/tests/build, documentation/test expectations, review, and acceptance in `CONTRIBUTING.md`
- [X] T125 [P] Add respectful community participation and enforcement expectations in `CODE_OF_CONDUCT.md`
- [X] T126 [P] Add a privacy and security operations guide documenting identity claims, active-list data, content-free receipts, retention, threat assumptions, cookies, CSRF, allowlist enforcement, secret rotation, minimal logs, and incident-safe diagnostics in `docs/security-and-privacy.md`
- [X] T127 Write cross-endpoint security tests that enumerate every protected route and prove session, current allowlist, Origin, CSRF where applicable, content type, safe structured errors, no-store, and non-disclosure behavior in `tests/contract/security-boundaries.contract.test.ts`
- [X] T128 Add a dependency-free production bundle checker enforcing at most 150 KiB gzip of initial JavaScript excluding images in `scripts/check-bundle-size.mjs`
- [X] T129 Add a build-output and source scan that rejects known secret names with populated values, provider tokens, `.dev.vars`, and source maps containing server configuration in `scripts/check-secret-exposure.mjs`
- [X] T130 Configure GitHub Actions to run npm clean install, lint, strict typecheck, unit/component tests, Worker/contract tests, production build, bundle and secret checks, then Playwright accessibility/visual/browser tests in `.github/workflows/ci.yml`
- [X] T131 Configure gated reproducible deployment to publish the private state Worker before Pages, use distinct preview/production namespaces and secrets, and never delete the Durable Object namespace during rollback in `.github/workflows/deploy.yml`
- [X] T132 [P] Add performance assertions for visible acknowledgment within one second and remote visibility within five seconds under representative throttling in `tests/e2e/performance.spec.ts`
- [X] T133 [P] Add an opt-in, non-CI real-Google login and deployed custom-domain smoke procedure that never records tokens or personal data in `docs/deployment-smoke-test.md`
- [ ] T134 Run and fix all automated gates through `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:workers`, `npm run build`, and `npm run test:e2e`, recording only reproducible commands and expected outcomes in `specs/001-shared-grocery-list/quickstart.md`
- [ ] T135 Complete and record manual checks for current screen reader, keyboard-only use, touch-only use, 200%/400% zoom and reflow, reduced motion, short viewport/virtual keyboard, slow/failing network, and 320/390/768/1440 widths in `docs/accessibility-validation.md`
- [X] T136 Perform the final constitution compliance and scope audit, documenting no unresolved exceptions and no out-of-scope roles, history, analytics, offline editing, notifications, multi-group, AI, advertising, or speculative infrastructure in `specs/001-shared-grocery-list/implementation-review.md`

**Release Checkpoint**: All required GitHub Actions checks pass; quickstart and manual validation are
complete; an operator can deploy independently; no secret, protected data, or out-of-scope behavior
is present.

---

## Dependencies and Execution Order

### Phase Dependencies

1. **Setup (Phase 1)** has no dependencies.
2. **Foundational (Phase 2)** depends on Setup and blocks every user story.
3. **US1 (Phase 3)** starts after Foundation and establishes the protected application boundary.
4. **US2 (Phase 4)** depends on US1 because all list reads are protected.
5. **US3 (Phase 5)** depends on US2 because additions reconcile into the authoritative list view.
6. **US4 (Phase 6)** depends on US3 because attribution is assigned and persisted during Add.
7. **US5 and US6 (Phases 7–8)** each depend on US3 and may proceed in parallel; both act by stable ID.
8. **US7 and US8 (Phases 9–10)** depend on US3 for populated-list validation and may proceed in
   parallel after the reusable confirmation primitive is coordinated; US8 may reuse the US7 dialog.
9. **US9 (Phase 11)** depends on mutation stories US3–US8 because it verifies their combined
   serialization, retry, durability, and convergence behavior.
10. **US10 (Phase 12)** integrates US1–US8 into the complete responsive and accessible experience;
    its tokens and independent test scaffolding can begin after Foundation.
11. **US11 (Phase 13)** depends on US1 and US2 but can otherwise proceed in parallel with US3–US10.
12. **Polish (Phase 14)** begins after all intended stories and blocks public release.

### User Story Dependency Graph

```text
Setup -> Foundation -> US1 -> US2 -> US3 -> US4
                                      |-> US5 -|
                                      |-> US6 -|
                                      |-> US7 -|-> US9 -> US10 -> Polish
                                      |-> US8 -|
                         US1 + US2 -> US11 -----|
```

US10 is shown late because its acceptance test spans all core flows, but its CSS tokens and test
design can be developed in parallel once Foundation is stable. US11 is P2 and does not block core
mutation implementation.

### Within Each Story

1. Write the story's unit, contract, Worker, component, and browser tests first as listed.
2. Confirm each test fails because the specified behavior is absent, not because setup is broken.
3. Implement pure models/transitions before Durable Object RPC methods.
4. Implement protected Pages endpoints before browser integration.
5. Implement UI integration before browser acceptance and story checkpoint validation.
6. Do not mark a story complete until its independent test passes without depending on a later
   story's product behavior.

## Parallel Execution Examples

The examples below identify safe same-story parallel starts after that story's dependencies are met.
Tasks that modify shared implementation files remain sequential even when their tests can be written
in parallel.

### US1 — Authentication

```text
Parallel: T029 auth unit tests | T030 endpoint contracts | T031 Worker integration | T032 UI component | T033 browser journey
Then: T034 -> T035 -> T036 -> T037/T038/T039/T040 -> T041
```

### US2 — Shared List View

```text
Parallel: T042 durable-read tests | T043 GET contract | T044 polling tests | T045 list component tests
Then: T046 -> T047 -> T048 -> T049 -> T050
```

### US3 — Add Items

```text
Parallel: T051 transition tests | T052 API/Worker tests | T053 form tests
Then: T054 -> T055 -> T056 -> T057 -> T058/T059 -> T060
```

### US4 — Creator Attribution

```text
Parallel: T061 trusted-identity tests | T062 creator-row tests | T063 two-user browser test
Then: T064 -> T065 -> T066
```

### US5 — Mark One Bought

```text
Parallel: T067 state/Worker tests | T068 endpoint contract | T069 component tests
Then: T070 -> T071 -> T072
```

### US6 — Remove One Item

```text
Parallel: T073 Worker tests | T074 endpoint contract | T075 menu component tests
Then: T076 -> T077 -> T078
```

### US7 — Clear List

```text
Parallel: T079 atomic/retry tests | T080 endpoint contract | T081 confirmation tests
Then: T082 -> T083 -> T084 -> T085
```

### US8 — Mark All Bought

```text
Parallel: T086 atomic/retry tests | T087 endpoint contract | T088 confirmation tests
Then: T089 -> T090 -> T091 -> T092
```

### US9 — Concurrent Collaboration

```text
Parallel: T093 concurrency trials | T094 retry trials | T095 restart cycles | T096 browser collaboration
Then: T097 -> T098 -> T099 -> T100/T101 -> T102
```

### US10 — Mobile and Accessible Experience

```text
Parallel: T103 component accessibility | T104 keyboard/axe | T105 visual snapshots | T106 responsive tests | T107 tokens
Then: T108 -> T109/T110/T111/T112 -> T113/T114 -> T115
```

### US11 — One Group Configuration

```text
Parallel: T116 configuration unit tests | T117 shared-group Worker tests | T118 browser configuration test
Then: T119 -> T120 -> T121
```

## Implementation Strategy

### First Security Checkpoint

1. Complete Setup and Foundation.
2. Complete US1 and independently validate login, allowlist enforcement, session continuity, and
   sign-out before exposing any list API.

US1 alone is a security milestone, not a useful grocery-list release.

### First Usable Vertical Slice

1. Add US2 for the protected durable list view.
2. Add US3 and US4 for correctly attributed item creation.
3. Add US5 for the primary in-store bought action.
4. Stop and validate the sign-in → view → add → attribution → buy flow on a phone.

This US1–US5 slice is the smallest useful CartMates demonstration. It is not the specification-
complete release.

### Specification-Complete MVP

1. Add US6–US8 for remaining individual and list-wide mutations.
2. Complete US9 before trusting multi-user production use.
3. Complete US10 before user-facing release.
4. Complete US11 and the Polish phase for documented self-hosting and public open-source release.

### Parallel Team Strategy

After the shared Foundation and US1 boundary are stable:

- One workstream can progress US2–US4.
- A second can prepare component and browser tests for US10 without changing unfinished shared UI.
- After US3, separate workstreams can implement US5/US6 and US7/US8.
- US11 configuration work can proceed after US2 independently of the mutation work.
- US9 remains the integration gate after all mutation paths exist.

## Notes

- `[P]` means safe parallel work only after all earlier dependency phases are complete.
- Every protected endpoint must use the shared authentication and current-allowlist wrapper.
- Every state-changing endpoint must additionally enforce exact Origin, CSRF, and idempotency.
- Creator name always comes from the authenticated server session; browser JSON never supplies it.
- Durable Object storage remains KV/NDJSON at the application layer despite mandatory SQLite backing.
- Mutation receipts are operational safeguards, not shopping or purchase history.
- Commit after each task or cohesive task group; never commit `.dev.vars` or real credentials.
- Stop at every checkpoint and keep later-story behavior out of earlier increments.



