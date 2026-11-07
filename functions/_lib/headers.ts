const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

export function secureHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(SECURITY_HEADERS);
  if (extra !== undefined) new Headers(extra).forEach((value, key) => headers.set(key, value));
  return headers;
}

export function jsonResponse(body: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(body, { status, headers: secureHeaders({ "Content-Type": "application/json; charset=utf-8", ...Object.fromEntries(new Headers(extra)) }) });
}

export function redirectResponse(location: string, cookie?: string): Response {
  const headers = secureHeaders({ Location: location });
  if (cookie !== undefined) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 302, headers });
}

export function emptyResponse(status = 204, extra?: HeadersInit): Response {
  return new Response(null, { status, headers: secureHeaders(extra) });
}
