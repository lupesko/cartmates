import type { ListCommand } from "../../../shared/api-contracts";
import { validateIdempotencyKey } from "../../../shared/validation";
import { requireSession } from "../../_lib/auth";
import { requireMutationProtection } from "../../_lib/csrf";
import type { PagesEnv } from "../../_lib/env";
import { safely } from "../../_lib/errors";
import { jsonResponse } from "../../_lib/headers";
import { mutateList } from "../../_lib/list-binding";

export const onRequestPost: PagesFunction<PagesEnv> = (context) => safely(async () => {
  const { claims, config } = await requireSession(context.request, context.env);
  requireMutationProtection(context.request, config.appOrigin, claims);
  const command: ListCommand = {
    kind: "markAllBought",
    operationId: validateIdempotencyKey(context.request.headers.get("Idempotency-Key")),
    actorSub: claims.sub,
  };
  const response = await mutateList(context.env, config, command);
  return jsonResponse(response, 200, { ETag: `"${response.list.revision}"` });
}, "list.mark_all_bought");
