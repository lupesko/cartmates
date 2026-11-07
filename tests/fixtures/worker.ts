import { env } from "cloudflare:test";
import type { SharedList } from "../../state-worker/shared-list";

export function freshList(): DurableObjectStub<SharedList> {
  return env.LIST.getByName(`test-${crypto.randomUUID()}`);
}
