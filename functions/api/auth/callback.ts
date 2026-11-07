import { AppError } from "../../../shared/api-contracts";
import { exchangeGoogleCode } from "../../_lib/auth";
import { clearOAuthCookie, readOAuthCookie, sessionCookie } from "../../_lib/cookies";
import { getConfig, type AppConfig, type PagesEnv } from "../../_lib/env";
import { errorResponse } from "../../_lib/errors";
import { redirectResponse, secureHeaders } from "../../_lib/headers";

function equal(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return difference === 0;
}

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  let config: AppConfig | undefined;
  try {
    config = getConfig(context.env);
    const url = new URL(context.request.url);
    if (url.searchParams.has("error")) throw new AppError("access_denied", 403, "Google sign-in was cancelled or denied");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (code === null || state === null) throw new AppError("invalid_request", 400, "Google sign-in response is incomplete");
    const transaction = await readOAuthCookie(context.request, config.sessionEncryptionKey);
    if (!equal(state, transaction.state)) throw new AppError("csrf_failed", 403, "Google sign-in response could not be verified");
    const claims = await exchangeGoogleCode(code, transaction, config);
    const headers = secureHeaders({ Location: `${config.appOrigin}${transaction.returnPath}` });
    headers.append("Set-Cookie", clearOAuthCookie());
    headers.append("Set-Cookie", await sessionCookie(claims, config.sessionEncryptionKey));
    return new Response(null, { status: 302, headers });
  } catch (error) {
    if (config !== undefined && error instanceof AppError && ["access_denied", "csrf_failed"].includes(error.code)) {
      const response = redirectResponse(`${config.appOrigin}/?auth=access-denied`, clearOAuthCookie());
      return response;
    }
    const response = errorResponse(error, "auth.callback");
    response.headers.append("Set-Cookie", clearOAuthCookie());
    return response;
  }
};
