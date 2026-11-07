import type { ErrorResponse, ListResponse, MutationResponse, SessionResponse } from "../../shared/api-contracts";

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly response: ErrorResponse) {
    super(response.error.message);
    this.name = "ApiError";
  }
}

export class NotModified extends Error {}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 304) throw new NotModified();
  const body = await response.json().catch(() => null) as T | ErrorResponse | null;
  if (!response.ok) {
    const error = body !== null && typeof body === "object" && "error" in body
      ? body as ErrorResponse
      : { error: { code: "internal_error" as const, message: "CartMates could not complete the request.", retryable: response.status >= 500 } };
    throw new ApiError(response.status, error);
  }
  return body as T;
}

export async function getSession(signal?: AbortSignal): Promise<SessionResponse> {
  return parse(await fetch("/api/session", { credentials: "same-origin", headers: { Accept: "application/json" }, signal: signal ?? null }));
}

export async function getList(etag?: string, signal?: AbortSignal): Promise<{ list: ListResponse; etag: string | null }> {
  const headers = new Headers({ Accept: "application/json" });
  if (etag !== undefined) headers.set("If-None-Match", etag);
  const response = await fetch("/api/list", { credentials: "same-origin", headers, signal: signal ?? null });
  return { list: await parse<ListResponse>(response), etag: response.headers.get("ETag") };
}

export interface MutationRequest {
  readonly path: string;
  readonly method: "POST" | "DELETE";
  readonly operationId: string;
  readonly body?: { readonly text: string };
}

export async function mutate(request: MutationRequest, csrfToken: string, signal?: AbortSignal): Promise<MutationResponse> {
  const headers = new Headers({ Accept: "application/json", "Idempotency-Key": request.operationId, "X-CSRF-Token": csrfToken });
  if (request.body !== undefined) headers.set("Content-Type", "application/json");
  return parse(await fetch(request.path, {
    method: request.method,
    credentials: "same-origin",
    headers,
    body: request.body === undefined ? null : JSON.stringify(request.body),
    signal: signal ?? null,
  }));
}

export function operation(path: string, method: "POST" | "DELETE" = "POST", body?: { readonly text: string }): MutationRequest {
  return body === undefined
    ? { path, method, operationId: crypto.randomUUID() }
    : { path, method, body, operationId: crypto.randomUUID() };
}

export async function logout(csrfToken: string): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "X-CSRF-Token": csrfToken },
  });
  if (!response.ok) await parse(response);
}
