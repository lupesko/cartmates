import { AppError, type ErrorResponse } from "../../shared/api-contracts";
import { jsonResponse } from "./headers";
import { logEvent, requestId } from "./logging";

const SAFE_MESSAGES: Readonly<Record<string, string>> = {
  invalid_request: "The request could not be understood.",
  validation_failed: "Please check the item and try again.",
  unauthenticated: "Please sign in to continue.",
  access_denied: "This Google account does not have access to CartMates.",
  csrf_failed: "The request could not be verified. Refresh and try again.",
  idempotency_conflict: "This request conflicts with an earlier operation. Refresh and try again.",
  unsupported_media_type: "This request must use JSON.",
  service_unavailable: "CartMates is temporarily unavailable. Please try again.",
  internal_error: "Something went wrong. Please try again.",
};

export function errorResponse(error: unknown, event = "request"): Response {
  const id = requestId();
  const appError = error instanceof AppError
    ? error
    : new AppError("internal_error", 500, SAFE_MESSAGES.internal_error ?? "Something went wrong", true);
  const body: ErrorResponse = {
    error: {
      code: appError.code,
      message: appError.status < 500 ? appError.message : (SAFE_MESSAGES[appError.code] ?? "Something went wrong"),
      retryable: appError.retryable,
    },
  };
  logEvent({ event, outcome: appError.status === 401 || appError.status === 403 ? "denied" : "failure", status: appError.status, durationMs: 0, requestId: id });
  return jsonResponse(body, appError.status, { "X-Request-Id": id });
}

export async function safely(run: () => Response | Promise<Response>, event: string): Promise<Response> {
  try { return await run(); } catch (error) { return errorResponse(error, event); }
}
