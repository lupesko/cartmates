import { AppError, type MutationCommand, type MutationResult, type OperationReceipt, type ShoppingListDocument } from "../shared/api-contracts";
import { parseListDocument, serializeListDocument } from "../shared/list-document";
import { applyCommand, commandFingerprint } from "../shared/list-state";
import { requireUuid } from "../shared/validation";

const DOCUMENT_KEY = "state/document";

export class ListStorage {
  constructor(private readonly storage: DurableObjectStorage) {}

  read(): ShoppingListDocument {
    return parseListDocument(this.storage.kv.get<string>(DOCUMENT_KEY));
  }

  async mutate(command: MutationCommand): Promise<MutationResult> {
    requireUuid(command.operationId, "operationId");
    if (command.actorSub.length === 0 || /[\/\u0000-\u001f\u007f]/u.test(command.actorSub)) {
      throw new AppError("invalid_request", 400, "Authenticated actor is invalid");
    }
    const receiptKey = `operation/${command.actorSub}/${command.operationId}`;
    const fingerprint = await commandFingerprint(command);
    return this.storage.transactionSync(() => {
      const current = this.read();
      const receipt = this.storage.kv.get<OperationReceipt>(receiptKey);
      if (receipt !== undefined) {
        if (receipt.fingerprint !== fingerprint || receipt.kind !== command.kind) {
          throw new AppError("idempotency_conflict", 409, "Idempotency key was used for a different request");
        }
        return { outcome: receipt.outcome, alreadyProcessed: true, document: current };
      }
      const transition = applyCommand(current, command);
      const next: ShoppingListDocument = {
        schemaVersion: 1,
        revision: current.revision + 1,
        items: transition.items,
      };
      const nextReceipt: OperationReceipt = {
        kind: command.kind,
        fingerprint,
        outcome: transition.outcome,
        revision: next.revision,
      };
      this.storage.kv.put(DOCUMENT_KEY, serializeListDocument(next));
      this.storage.kv.put(receiptKey, nextReceipt);
      return { outcome: transition.outcome, alreadyProcessed: false, document: next };
    });
  }
}
