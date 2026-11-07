# CartMates Architecture

CartMates deliberately uses one browser application, one same-origin API boundary, and one private
state coordinator. Pages serves the Vite/React application. Pages Functions verify every protected
request and bind directly to `SharedList` in the separately deployed `cartmates-state` Worker.

## State and coordination

Every instance resolves the name `shared-list-v1`, so all members reach one Durable Object. Public
requests cannot reach that object directly. Its synchronous transactional KV interface stores:

- `state/document`: schema-version and revision metadata followed by ordered active item records in
  NDJSON; and
- `operation/<actor-sub>/<operation-id>`: operation kind, request fingerprint, outcome, and resulting
  revision without grocery or identity content.

A first-seen command reads and strictly validates the document, applies one transition, increments
the revision even for a safe no-op, then writes document and receipt in one `transactionSync` call.
Success is returned only afterward. A matching retry returns the current document without repeating
the effect. A mismatched reuse returns a structured 409. Receipts remain for the MVP so a delayed
Clear or Mark All retry cannot delete later additions.

Item IDs are backend-generated UUIDs. Duplicate text is expected. Bought and removed items disappear;
there is no history or archive. Creator name is copied from the authenticated session during Add and
never changes.

## Authentication boundary

Google Authorization Code OIDC uses PKCE S256, state, and nonce. Pages Functions exchange the code,
verify Google's signed ID token, require verified email and display name, check the exact static
allowlist, discard provider tokens, and issue a fixed 24-hour encrypted host-only session. Every
protected request rechecks the current allowlist. Mutations also require exact Origin and session-
bound CSRF token.

## Synchronization and failure

Mutation responses contain the full authoritative list. The browser never commits a destructive
optimistic state. It conditionally polls every three seconds using the revision ETag, pauses while
hidden, and refreshes on focus or reconnection. A failed or uncertain mutation retains the same UUID
idempotency key for explicit retry.

## Deployment and rollback

Deploy the private state Worker/migration before Pages. Preview and production require separate
namespaces. A rollback redeploys known-good code in the same order and never deletes, renames, or
replaces the existing Durable Object namespace. NDJSON schema changes require an explicit versioned
migration and backward-compatibility review.
