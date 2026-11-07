import { DurableObject } from "cloudflare:workers";
import { AppError, type MutationCommand, type MutationResult, type MutationRpcResult, type ShoppingListDocument } from "../shared/api-contracts";
import type { StateEnv } from "./env";
import { ListStorage } from "./storage";

export class SharedList extends DurableObject<StateEnv> {
  readonly #store: ListStorage;

  constructor(ctx: DurableObjectState, env: StateEnv) {
    super(ctx, env);
    this.#store = new ListStorage(ctx.storage);
  }

  getList(): ShoppingListDocument {
    return this.#store.read();
  }

  async mutate(command: MutationCommand): Promise<MutationResult> {
    return this.#store.mutate(command);
  }

  async mutateSafe(command: MutationCommand): Promise<MutationRpcResult> {
    try {
      return { ok: true, result: await this.#store.mutate(command) };
    } catch (error) {
      const appError = error instanceof AppError
        ? error
        : new AppError("internal_error", 500, "List operation failed", true);
      return { ok: false, error: { code: appError.code, status: appError.status, message: appError.message, retryable: appError.retryable } };
    }
  }
}
