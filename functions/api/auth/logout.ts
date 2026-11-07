import { requireSession } from "../../_lib/auth";
import { clearSessionCookie } from "../../_lib/cookies";
import { requireMutationProtection } from "../../_lib/csrf";
import type { PagesEnv } from "../../_lib/env";
import { safely } from "../../_lib/errors";
import { emptyResponse } from "../../_lib/headers";

export const onRequestPost: PagesFunction<PagesEnv> = (context) => safely(async () => {
  const { claims, config } = await requireSession(context.request, context.env);
  requireMutationProtection(context.request, config.appOrigin, claims);
  return emptyResponse(204, { "Set-Cookie": clearSessionCookie() });
}, "auth.logout");
