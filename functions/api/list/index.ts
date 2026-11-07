import { requireSession } from "../../_lib/auth";
import type { PagesEnv } from "../../_lib/env";
import { safely } from "../../_lib/errors";
import { secureHeaders, jsonResponse } from "../../_lib/headers";
import { readList, toListResponse } from "../../_lib/list-binding";

export const onRequestGet: PagesFunction<PagesEnv> = (context) => safely(async () => {
  const { config } = await requireSession(context.request, context.env);
  const document = await readList(context.env);
  const etag = `"${document.revision}"`;
  if (context.request.headers.get("If-None-Match") === etag) {
    return new Response(null, { status: 304, headers: secureHeaders({ ETag: etag }) });
  }
  return jsonResponse(toListResponse(document, config), 200, { ETag: etag });
}, "list.read");
