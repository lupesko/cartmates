import type { ErrorResponse, ListResponse, SessionResponse } from "../../shared/api-contracts";

export type SessionState =
  | { readonly kind: "loading" }
  | { readonly kind: "signedOut"; readonly denied: boolean }
  | { readonly kind: "ready"; readonly session: SessionResponse }
  | { readonly kind: "error"; readonly message: string };

export interface ListUiState {
  readonly list: ListResponse | null;
  readonly loading: boolean;
  readonly pendingAction: string | null;
  readonly message: { readonly tone: "success" | "error" | "info"; readonly text: string } | null;
  readonly retryAvailable: boolean;
}

export function errorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "error" in error) {
    const response = error as ErrorResponse;
    return response.error.message;
  }
  return "CartMates could not connect. Check your connection and try again.";
}
