export interface LogEvent {
  readonly event: string;
  readonly outcome: "success" | "denied" | "failure";
  readonly status: number;
  readonly durationMs: number;
  readonly requestId: string;
}

export function requestId(): string {
  return crypto.randomUUID();
}

export function logEvent(event: LogEvent): void {
  console.log(JSON.stringify(event));
}
