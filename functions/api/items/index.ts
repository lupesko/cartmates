import { AppError, type AddCommand } from "../../../shared/api-contracts";
import { assertExactKeys, assertPlainObject, normalizeItemText, validateIdempotencyKey } from "../../../shared/validation";
import { requireSession } from "../../_lib/auth";
import { requireMutationProtection } from "../../_lib/csrf";
import type { PagesEnv } from "../../_lib/env";
import { safely } from "../../_lib/errors";
import { jsonResponse } from "../../_lib/headers";
import { mutateList } from "../../_lib/list-binding";

export const onRequestPost: PagesFunction<PagesEnv> = (context) => safely(async () => {
  const { claims, config } = await requireSession(context.request, context.env);
  requireMutationProtection(context.request, config.appOrigin, claims, true);
  let body: unknown;
  try { body = await context.request.json(); } catch { throw new AppError("invalid_request", 400, "Request body must be valid JSON"); }
  assertPlainObject(body);
  assertExactKeys(body, ["text"]);
  const command: AddCommand = {
    kind: "add",
    operationId: validateIdempotencyKey(context.request.headers.get("Idempotency-Key")),
    actorSub: claims.sub,
    actorName: claims.name,
    text: normalizeItemText(body.text),
  };
  const response = await mutateList(context.env, config, command);
  return jsonResponse(response, 200, { ETag: `"${response.list.revision}"` });
}, "item.add");
