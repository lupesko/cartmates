import { AppError } from "../../shared/api-contracts";
import type { SessionClaims } from "../../shared/api-contracts";

function constantTimeEqual(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return difference === 0;
}

export function requireMutationProtection(request: Request, appOrigin: string, claims: SessionClaims, jsonRequired = false): void {
  if (request.headers.get("Origin") !== appOrigin) throw new AppError("csrf_failed", 403, "The request origin could not be verified");
  const csrf = request.headers.get("X-CSRF-Token");
  if (csrf === null || !constantTimeEqual(csrf, claims.csrf)) throw new AppError("csrf_failed", 403, "The request could not be verified");
  if (jsonRequired && !request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    throw new AppError("unsupported_media_type", 415, "This request must use JSON");
  }
}
