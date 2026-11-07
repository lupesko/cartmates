import type { MutationCommand, MutationResponse, ShoppingListDocument } from "../../shared/api-contracts";
import { AppError } from "../../shared/api-contracts";
import type { AppConfig, PagesEnv } from "./env";

export function listStub(env: PagesEnv) {
  return env.LIST.getByName("shared-list-v1");
}

export function toListResponse(document: ShoppingListDocument, config: AppConfig) {
  return { revision: document.revision, items: document.items, remainingCount: document.items.length, groupName: config.groupName };
}

export async function readList(env: PagesEnv): Promise<ShoppingListDocument> {
  try {
    return await listStub(env).getList();
  } catch {
    throw new AppError("service_unavailable", 503, "The shared list is temporarily unavailable", true);
  }
}

export async function mutateList(env: PagesEnv, config: AppConfig, command: MutationCommand): Promise<MutationResponse> {
  let rpc;
  try {
    rpc = await listStub(env).mutateSafe(command);
  } catch {
    throw new AppError("service_unavailable", 503, "The shared list is temporarily unavailable", true);
  }
  if (!rpc.ok) throw new AppError(rpc.error.code, rpc.error.status, rpc.error.message, rpc.error.retryable);
  const result = rpc.result;
  return { outcome: result.outcome, alreadyProcessed: result.alreadyProcessed, list: toListResponse(result.document, config) };
}
