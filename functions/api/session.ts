import type { SessionResponse } from "../../shared/api-contracts";
import { requireSession } from "../_lib/auth";
import type { PagesEnv } from "../_lib/env";
import { safely } from "../_lib/errors";
import { jsonResponse } from "../_lib/headers";

function initials(name: string): string {
  return name.trim().split(/\s+/u).slice(0, 2).map((part) => [...part][0] ?? "").join("").toLocaleUpperCase().slice(0, 4);
}

export const onRequestGet: PagesFunction<PagesEnv> = (context) => safely(async () => {
  const { claims, config } = await requireSession(context.request, context.env);
  const response: SessionResponse = {
    user: { displayName: claims.name, initials: initials(claims.name) },
    groupName: config.groupName,
    csrfToken: claims.csrf,
  };
  return jsonResponse(response);
}, "session.read");
