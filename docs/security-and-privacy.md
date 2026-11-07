# Security and Privacy Operations

## Threat assumptions and controls

Browser code and requests are untrusted. Every protected Pages Function independently decrypts and
validates the session, checks expiry, and rechecks exact normalized email membership. Mutations also
check exact configured Origin, a constant-time session CSRF value, content type where applicable,
strict request fields, UUID path/idempotency values, and domain validation. The Durable Object is
private and receives actor identity only from Pages Functions.

OIDC transactions expire in ten minutes and use one-time state, nonce, and PKCE. Sessions expire after
24 hours and use AES-GCM JWE in `__Host-cartmates_session` with Secure, HttpOnly, SameSite=Strict,
Path `/`, no Domain, and explicit Max-Age. OAuth callbacks use a separate SameSite=Lax transaction
cookie. Google tokens are discarded after ID-token verification.

## Secrets and least privilege

Store `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAILS`, and `SESSION_ENCRYPTION_KEY` as Cloudflare encrypted
secrets. Give CI a scoped API token that can deploy only the intended Pages/Worker resources. Keep
preview and production resources and secrets separate. Rotate a compromised session key and Google
secret, then require users to sign in again. Never put secrets in `VITE_` variables.

## Stored data and retention

Active list records contain UUID, item text, and creator display-name snapshot. Encrypted session
cookies contain version, Google subject, normalized email, name, CSRF value, issued-at, and expiry.
Idempotency receipts contain no item text, display name, email, or snapshot. Receipts are retained in
the MVP for destructive retry correctness. There are no profiles, history, analytics, ads, or
third-party trackers.

## Logging and diagnostics

Logs may contain only event type, coarse outcome, status, duration, and a random request ID. Never
log authorization codes, tokens, cookies, emails, names, allowlists, item text, list state, request
bodies, or full exception objects from identity/storage boundaries. Ask reporters for reproduction
steps and request IDs—not private data.

Protected/auth responses are no-store and carry restrictive CSP, frame, referrer, and content-type
headers. Same-origin APIs do not enable permissive CORS.
