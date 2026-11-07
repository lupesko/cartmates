export type FailurePoint = "before-send" | "after-commit-before-response" | "offline";

export class ControlledNetworkFailure extends Error {
  constructor(public readonly point: FailurePoint) {
    super(`Controlled network failure: ${point}`);
  }
}

export class NetworkController {
  private nextFailure: FailurePoint | null = null;
  private offline = false;

  failNext(point: Exclude<FailurePoint, "offline">): void {
    this.nextFailure = point;
  }

  disconnect(): void {
    this.offline = true;
  }

  reconnect(): void {
    this.offline = false;
  }

  beforeSend(): void {
    if (this.offline) throw new ControlledNetworkFailure("offline");
    if (this.nextFailure === "before-send") {
      this.nextFailure = null;
      throw new ControlledNetworkFailure("before-send");
    }
  }

  afterCommit(): void {
    if (this.offline) throw new ControlledNetworkFailure("offline");
    if (this.nextFailure === "after-commit-before-response") {
      this.nextFailure = null;
      throw new ControlledNetworkFailure("after-commit-before-response");
    }
  }
}
