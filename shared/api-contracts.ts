export interface GroceryItem {
  readonly id: string;
  readonly text: string;
  readonly creatorName: string;
}

export interface ShoppingListDocument {
  readonly schemaVersion: 1;
  readonly revision: number;
  readonly items: readonly GroceryItem[];
}

export interface ListResponse {
  readonly revision: number;
  readonly items: readonly GroceryItem[];
  readonly remainingCount: number;
  readonly groupName: string;
}

export type MutationKind = "add" | "remove" | "markBought" | "clear" | "markAllBought";
export type MutationOutcome = "applied" | "already_absent" | "already_empty";

interface CommandBase {
  readonly operationId: string;
  readonly actorSub: string;
}

export interface AddCommand extends CommandBase {
  readonly kind: "add";
  readonly actorName: string;
  readonly text: string;
}

export interface ItemCommand extends CommandBase {
  readonly kind: "remove" | "markBought";
  readonly itemId: string;
}

export interface ListCommand extends CommandBase {
  readonly kind: "clear" | "markAllBought";
}

export type MutationCommand = AddCommand | ItemCommand | ListCommand;

export interface OperationReceipt {
  readonly kind: MutationKind;
  readonly fingerprint: string;
  readonly outcome: MutationOutcome;
  readonly revision: number;
}

export interface MutationResult {
  readonly outcome: MutationOutcome;
  readonly alreadyProcessed: boolean;
  readonly document: ShoppingListDocument;
}

export type MutationRpcResult =
  | { readonly ok: true; readonly result: MutationResult }
  | { readonly ok: false; readonly error: { readonly code: ErrorCode; readonly status: number; readonly message: string; readonly retryable: boolean } };

export interface MutationResponse {
  readonly outcome: MutationOutcome;
  readonly alreadyProcessed: boolean;
  readonly list: ListResponse;
}

export interface SessionClaims {
  readonly v: 1;
  readonly sub: string;
  readonly email: string;
  readonly name: string;
  readonly csrf: string;
  readonly iat: number;
  readonly exp: number;
}

export interface OAuthTransaction {
  readonly state: string;
  readonly nonce: string;
  readonly codeVerifier: string;
  readonly returnPath: string;
  readonly iat: number;
  readonly exp: number;
}

export interface SessionResponse {
  readonly user: { readonly displayName: string; readonly initials: string };
  readonly groupName: string;
  readonly csrfToken: string;
}

export type ErrorCode =
  | "invalid_request"
  | "validation_failed"
  | "unauthenticated"
  | "access_denied"
  | "csrf_failed"
  | "idempotency_conflict"
  | "unsupported_media_type"
  | "service_unavailable"
  | "internal_error";

export interface ErrorResponse {
  readonly error: { readonly code: ErrorCode; readonly message: string; readonly retryable: boolean };
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "AppError";
  }
}
