import { createOAuthTransaction, pkceChallenge } from "../../_lib/auth";
import { oauthCookie } from "../../_lib/cookies";
import { getConfig, type PagesEnv } from "../../_lib/env";
import { safely } from "../../_lib/errors";
import { redirectResponse } from "../../_lib/headers";
import { requireLocalReturnPath } from "../../../shared/validation";

export const onRequestGet: PagesFunction<PagesEnv> = (context) => safely(async () => {
  const config = getConfig(context.env);
  const url = new URL(context.request.url);
  const transaction = createOAuthTransaction(requireLocalReturnPath(url.searchParams.get("returnTo")));
  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.search = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: `${config.appOrigin}/api/auth/callback`,
    response_type: "code",
    scope: "openid email profile",
    state: transaction.state,
    nonce: transaction.nonce,
    code_challenge: await pkceChallenge(transaction.codeVerifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return redirectResponse(authorization.toString(), await oauthCookie(transaction, config.sessionEncryptionKey));
}, "auth.login");
