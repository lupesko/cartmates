import { AppError, type SessionClaims } from "./api-contracts";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const CONTROL_PATTERN = /[\u0000-\u001f\u007f]/u;

export function assertPlainObject(value: unknown, message = "Request body must be a JSON object"): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AppError("invalid_request", 400, message);
  }
}

export function assertExactKeys(value: Record<string, unknown>, keys: readonly string[]): void {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new AppError("invalid_request", 400, "Request contains unsupported fields");
  }
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function requireUuid(value: unknown, field = "identifier"): string {
  if (typeof value !== "string" || !isUuid(value)) {
    throw new AppError("invalid_request", 400, `${field} must be a UUID`);
  }
  return value.toLowerCase();
}

export function normalizeItemText(value: unknown): string {
  if (typeof value !== "string") {
    throw new AppError("validation_failed", 400, "Enter an item name");
  }
  const text = value.trim();
  if (text.length === 0) throw new AppError("validation_failed", 400, "Enter an item name");
  if (CONTROL_PATTERN.test(text)) throw new AppError("validation_failed", 400, "Item names must use one line");
  if ([...text].length > 200) throw new AppError("validation_failed", 400, "Item names can be at most 200 characters");
  return text;
}

export function requireDisplayName(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0 || CONTROL_PATTERN.test(value)) {
    throw new AppError("access_denied", 403, "Your Google account must provide a display name");
  }
  return value.trim();
}

export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") throw new AppError("access_denied", 403, "A verified email address is required");
  const email = value.trim().toLocaleLowerCase("en-US");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    throw new AppError("access_denied", 403, "A verified email address is required");
  }
  return email;
}

export function parseAllowlist(value: string): ReadonlySet<string> {
  const emails = value.split(",").map((entry) => entry.trim()).filter(Boolean).map(normalizeEmail);
  if (emails.length === 0) throw new AppError("internal_error", 500, "Authorization is not configured");
  return new Set(emails);
}

export function requireLocalReturnPath(value: string | null): string {
  if (value === null || value === "") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || CONTROL_PATTERN.test(value)) {
    throw new AppError("invalid_request", 400, "Return path must be local");
  }
  return value;
}

export function requireNonEmptyConfig(value: string | undefined, name: string): string {
  if (value === undefined || value.trim() === "") throw new AppError("internal_error", 500, `${name} is not configured`);
  return value.trim();
}

export function validateSessionClaims(value: unknown, nowSeconds = Math.floor(Date.now() / 1000)): SessionClaims {
  assertPlainObject(value, "Session is invalid");
  const v = value.v;
  const sub = value.sub;
  const email = value.email;
  const name = value.name;
  const csrf = value.csrf;
  const iat = value.iat;
  const exp = value.exp;
  if (v !== 1 || typeof sub !== "string" || sub.length === 0 || typeof csrf !== "string" || csrf.length < 32 ||
      typeof iat !== "number" || typeof exp !== "number" || iat > nowSeconds + 60 || exp <= nowSeconds || exp - iat > 86_400) {
    throw new AppError("unauthenticated", 401, "Your session has expired. Please sign in again.");
  }
  return { v, sub, email: normalizeEmail(email), name: requireDisplayName(name), csrf, iat, exp };
}

export function validateIdempotencyKey(value: string | null): string {
  return requireUuid(value, "Idempotency-Key");
}

export function validateGroupName(value: string | undefined): string {
  const name = value?.trim() || "Our Groceries";
  if (CONTROL_PATTERN.test(name)) throw new AppError("internal_error", 500, "Group display name is invalid");
  return name;
}
