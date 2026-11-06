# Phase 0 Research: Shared Grocery List

**Date**: 2026-11-06
**Status**: Complete — no unresolved clarifications

## 1. Frontend and Tooling Baseline

**Decision**: Use a client-rendered React 19.3 single-page application built with Vite 8.x and
TypeScript 5.9.x in strict mode. Use Node.js 24 LTS and npm with a committed lockfile for local
tooling and CI. Use plain CSS, the supplied design tokens, and the supplied SVG assets. Keep runtime
frontend dependencies to `react` and `react-dom`.

**Rationale**: React is a boring, proven choice for the interacting list, polling, pending/error
states, menus, dialogs, focus management, and responsive UI. Vite is the official lightweight Pages
path. A single SPA needs no router, server rendering, state library, query library, CSS framework, or
component library. Node 24 is a mature LTS line; TypeScript strictness is constitution-mandated.

**Alternatives considered**:

- Vanilla TypeScript: fewer dependencies, but significantly more manual DOM, focus, and state
  synchronization for this interaction-heavy UI.
- Preact: smaller, but less familiar to occasional contributors and unnecessary at this scale.
- Next.js, Remix, or another full-stack framework: routing and server-rendering features are not
  required and would overlap with the Cloudflare backend.

**Sources**:

- [Cloudflare Pages React guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [Vite guide](https://vite.dev/guide/)
- [React versions](https://react.dev/versions)
- [Node.js release status](https://nodejs.org/en/about/previous-releases)
- [TypeScript 5.9 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)

## 2. Cloudflare Deployment Topology

**Decision**: Use two Cloudflare deployment units:

1. A Cloudflare Pages project hosts the Vite build and same-origin Pages Functions for `/api/*`.
2. A private Worker defines and deploys the `SharedList` Durable Object class and namespace. It has
   no public route. The Pages project binds directly to that external class with `script_name`.

The Pages Functions authenticate and authorize each request, validate input and CSRF, and call one
named Durable Object (`shared-list-v1`) through typed RPC methods.

**Rationale**: Cloudflare does not permit a Pages project to define and deploy its own Durable Object
class. A direct external Durable Object binding is the minimum supported topology and avoids an
unnecessary service-binding facade. Same-origin Pages Functions keep cookies, CSRF, CORS, and
self-host configuration simple.

**Alternatives considered**:

- A single Worker serving frontend and backend: one deployment, but violates the constitution's
  explicit Cloudflare Pages requirement.
- Pages to service-bound Worker to Durable Object: valid, but adds an internal routing layer with no
  current requirement.
- Public backend Worker on another origin: adds CORS and cookie complexity.

**Sources**:

- [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Durable Objects overview](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/)

## 3. Coordination and Persistence

**Decision**: Use one named `SharedList` Durable Object per deployed CartMates group. Configure the
class as SQLite-backed because Cloudflare requires that backend for new namespaces, but use only the
synchronous key-value API—no SQL tables and no ORM.

Persist:

- `state/document`: a human-readable NDJSON string containing one metadata record
  (`schemaVersion`, `revision`) followed by one record per active item (`id`, `text`,
  `creatorName`). Record order is list order.
- `operation/<google-sub>/<idempotency-key>`: a minimal receipt containing request fingerprint,
  operation kind, outcome, and resulting revision. It contains no item text, creator name, or
  purchase history.

Each mutation runs in one synchronous storage transaction: check the receipt, parse and validate the
document, apply exactly one operation, increment revision, then write both the document and receipt.
Receipts are retained for the MVP so delayed retries of Clear or Mark All cannot remove later items.

**Rationale**: A Durable Object is the correct single serialization boundary for one collaborative
list. Its private, strongly consistent, transactional storage survives eviction and deployment.
Synchronous KV operations preserve the simple human-readable model required by the constitution,
while the mandatory SQLite backing is only a platform storage engine detail.

**Alternatives considered**:

- Workers KV: eventually consistent and unsuitable for serialized read-modify-write operations.
- D1 or relational Durable Object tables: unnecessary schema complexity for one ordered document.
- R2 or a file object: does not provide the required mutation coordination.
- In-memory state: loses data when the object is evicted or redeployed.

**Sources**:

- [Durable Object rules and coordination](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)
- [SQLite-backed Durable Object storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
- [New Durable Object namespaces require SQLite backing](https://developers.cloudflare.com/changelog/post/2026-07-09-restrict-new-kv-backed-namespaces/)

## 4. Retry Safety and Synchronization

**Decision**: Require a client-generated UUID in the `Idempotency-Key` header on every mutation. The
client reuses the same key only when retrying an uncertain request. The Durable Object returns the
current authoritative state without reapplying a recorded operation and rejects reuse of a key with
a different request fingerprint.

Mutations return the full authoritative list and revision. Active clients poll every three seconds
with an ETag/`If-None-Match` conditional request, use sequential timeouts to prevent overlap, pause
while hidden, and refresh immediately on focus or reconnect. No destructive mutation is applied
optimistically.

**Rationale**: Persisted receipts prevent a retried list-wide operation from affecting later items.
Three-second polling satisfies the five-second visibility target while following the constitution's
preference for polling over real-time infrastructure.

**Alternatives considered**:

- WebSockets or push: unnecessary infrastructure for a small list and explicitly disfavored until
  polling proves insufficient.
- Revision-based client writes: risks rejecting or overwriting valid concurrent intent; the Durable
  Object already serializes operations by item identity.
- Optimistic destructive UI: can show false success under network uncertainty.

**Sources**:

- [Automatic Durable Object retries](https://developers.cloudflare.com/durable-objects/best-practices/automatic-retries/)
- [React effect synchronization and cleanup](https://react.dev/reference/react/useEffect)

## 5. Google OpenID Connect

**Decision**: Implement a same-origin backend-for-frontend login in Pages Functions using Google's
OpenID Connect Authorization Code flow with PKCE `S256`, one-time `state`, and `nonce`.

The callback exchanges the code server-side, verifies the ID-token signature from Google's JWKS,
and validates issuer, audience, authorized party when present, expiry, issued-at time, nonce,
`sub`, email, `email_verified=true`, and a non-empty display name. It then normalizes and checks the
email against the current static allowlist. Provider tokens are discarded after validation because
CartMates calls no Google APIs. Use Google `sub` as the stable identity; do not use `hd` as
authorization.

Use `jose` 6.x for remote-JWKS JWT verification and JWE session encryption rather than implementing
JOSE primitives. It supports Cloudflare Workers and has no runtime dependency tree.

**Rationale**: The BFF pattern keeps provider tokens out of browser JavaScript. PKCE, state, and
nonce protect the authorization transaction. Exact server-side allowlist enforcement is required by
the specification and constitution.

**Alternatives considered**:

- Browser-side implicit or credential flow: exposes identity credentials to frontend code.
- Google Workspace `hd` hint: not an authorization control and cannot replace the exact allowlist.
- Refresh tokens: unnecessary because no Google API access is retained.
- Hand-written JWT/JWE cryptography: avoidable security risk.

**Sources**:

- [Google OpenID Connect server flow](https://developers.google.com/identity/openid-connect/openid-connect)
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/rfc9700)
- [OAuth browser-app BFF pattern](https://datatracker.ietf.org/doc/html/rfc10017#section-6.1)
- [`jose` runtime and security model](https://github.com/panva/jose/security)

## 6. Sessions, CSRF, and Response Security

**Decision**: After login, issue a 24-hour fixed-lifetime AES-GCM JWE session cookie containing only
version, Google `sub`, normalized email, display name, issued-at, expiry, and a random CSRF token.
Use `__Host-cartmates_session`, `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, no `Domain`, and an
explicit `Max-Age`. Recheck the allowlist on every protected request so removal takes effect
immediately.

The transient OAuth cookie has a ten-minute lifetime and uses `Secure`, `HttpOnly`, `SameSite=Lax`,
`Path=/`, and no `Domain` so it returns on Google's top-level callback. Consume it once.

Every state-changing endpoint, including logout, requires an exact configured `Origin`, JSON where
applicable, and an `X-CSRF-Token` equal to the session claim. Do not enable permissive CORS. Set
`Cache-Control: no-store` on auth and protected responses and apply CSP, `frame-ancestors 'none'`,
`Referrer-Policy: no-referrer`, and `X-Content-Type-Options: nosniff`.

**Rationale**: Encrypted stateless sessions avoid a session database while protecting necessary
identity claims. A fixed short lifetime bounds the inability to centrally revoke a copied cookie.
Origin and token checks provide explicit CSRF protection beyond SameSite.

**Alternatives considered**:

- Durable Object session store: enables immediate revocation but adds state and operations not
  required by the current specification.
- Signed but unencrypted identity cookie: exposes email and display name at rest in the browser.
- Revoking Google consent on logout: excessive; clearing the CartMates cookie ends the local session.

**Sources**:

- [RFC 10017 cookie and CSRF guidance](https://datatracker.ietf.org/doc/html/rfc10017#section-6.1.3.2)
- [Cloudflare Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
- [Cloudflare Pages secrets](https://developers.cloudflare.com/pages/functions/bindings/#secrets)

## 7. API Shape and Error Handling

**Decision**: Expose a small JSON API through Pages Functions:

- authentication login, callback, session, and logout;
- read list;
- add, remove, mark bought, clear, and mark all bought.

Every protected handler calls the same authorization wrapper. Responses use shared TypeScript
contracts. Errors use `{ error: { code, message, retryable } }`, contain no personal or list data,
and distinguish authentication, authorization, CSRF, validation, idempotency conflict, unavailable
storage, and unexpected failures. Stale item removal/bought operations return a successful
`already_absent` outcome without changing another item.

**Rationale**: A narrow same-origin contract is easy to test independently and keeps authorization
server-side. Returning authoritative state after mutations simplifies client reconciliation.

**Alternatives considered**:

- GraphQL: unnecessary schema/runtime dependency for six list operations.
- Generic mutation endpoint: smaller route count but weaker validation and less readable contracts.
- Exposing the Durable Object publicly: bypasses the authenticated Pages boundary.

## 8. UI, Assets, Accessibility, and Bundle Discipline

**Decision**: Implement the supplied three compositions with semantic HTML, native controls, plain
CSS, and provided SVG assets. Keep all text live. Use a scrollable list region, safe-area insets,
dynamic viewport units, 44-by-44 CSS-pixel targets, dialog focus trap/restore, status announcements,
visible focus, and reduced-motion behavior. Do not render device chrome.

Use a 150 KiB gzip budget for total initial JavaScript, excluding images, as a project guardrail.
Fail CI through a dependency-free size script if the budget is exceeded. Any new runtime dependency
requires explicit justification.

**Rationale**: This directly implements the approved design while preserving WCAG 2.2 AA and slower
mobile-network usability. Plain CSS and supplied assets avoid a component or animation framework.

**Alternatives considered**:

- Rasterizing mockup screens: prevents responsive, dynamic, and accessible content.
- UI/CSS component framework: unnecessary weight and visual constraints.
- Pixel comparison against the phone-frame mockup: brittle and would validate non-application
  device chrome; use reviewed app-only baselines instead.

**Sources**:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Vite build options](https://vite.dev/config/build-options.html)
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)

## 9. Test Strategy

**Decision**: Use four focused layers:

1. Vitest for pure validation, serialization, state transitions, and client helpers.
2. React Testing Library with jsdom for components and accessible interactions.
3. Vitest 4.1+ with `@cloudflare/vitest-plugin` for Pages Functions, Worker bindings, Durable Object
   persistence, concurrency, retry, eviction/restart, authentication, and authorization behavior.
4. Playwright with `@axe-core/playwright` for end-to-end, multi-context collaboration, keyboard,
   modal focus, responsive, visual, failure recovery, and automated accessibility checks.

Retain manual quickstart checks for screen readers, zoom/reflow, reduced motion, and touch because
automated accessibility scans are incomplete. Do not impose an arbitrary line-coverage percentage.

**Rationale**: The layers test business logic quickly, then exercise the actual Workers runtime and
browser behaviors demanded by the constitution.

**Alternatives considered**:

- Legacy `@cloudflare/vitest-pool-workers`: replaced in 2026 by the supported plugin.
- Browser tests only: slow and insufficient for deterministic concurrency/storage assertions.
- Automated accessibility scans only: cannot establish full WCAG conformance.

**Sources**:

- [Cloudflare testing overview](https://developers.cloudflare.com/workers/testing/)
- [Cloudflare Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Playwright CI guidance](https://playwright.dev/docs/ci)

## 10. CI, Deployment, Logging, and Privacy

**Decision**: GitHub Actions runs install, lint, strict typecheck, pure/component tests, Workers
runtime/integration tests, production build, bundle budget, and then Playwright browser/accessibility/
visual tests. Deployment runs only after quality gates: deploy the state Worker and namespace first,
then deploy Pages with its external binding. Preview and production use distinct Worker namespaces.

Store `GOOGLE_CLIENT_SECRET`, `SESSION_ENCRYPTION_KEY`, and the email allowlist as encrypted
Cloudflare secrets. Keep local values in ignored `.dev.vars`. Configuration includes app origin,
client ID, callback path, and group name. Logs contain only event type, coarse outcome, status,
duration, and a random request ID—never tokens, codes, email, display name, allowlist, item text, or
list state.

**Rationale**: This meets the reproducibility, least-privilege, privacy, and mandatory quality gates
without adding observability infrastructure or analytics.

**Alternatives considered**:

- Deploy before browser tests: risks publishing a change that fails accessibility or collaboration.
- Shared preview/production state: risks test data contaminating production.
- Third-party analytics/error tracking: explicitly out of scope and conflicts with privacy rules.

**Sources**:

- [Cloudflare local development](https://developers.cloudflare.com/workers/local-development/)
- [GitHub Actions Node guidance](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [Cloudflare Pages secrets](https://developers.cloudflare.com/pages/functions/bindings/#secrets)
