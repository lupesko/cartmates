# Deployment Smoke Test

Run this procedure after preview/production deployment without recording tokens, cookies, personal
data, list contents, or screenshots containing private data.

1. Confirm the custom HTTPS origin and exact Google callback configuration.
2. Confirm signed-out `GET /api/list` returns 401, no list data, and `Cache-Control: no-store`.
3. Sign in with one approved test account; verify the configured group and add one disposable item.
4. Verify a second approved session sees the change within five seconds.
5. Verify an unlisted account gets the friendly denial and no protected response.
6. Sign out and confirm the previous browser can no longer read the API.
7. Verify CSP, frame, referrer, nosniff, Secure, HttpOnly, SameSite, and host-only cookie attributes.
8. Redeploy the Worker without deleting its namespace and verify the acknowledged item remains.
9. Remove the disposable item and record only deployment revision, coarse outcome, and time.

Real-Google smoke tests are intentionally opt-in and excluded from CI.
