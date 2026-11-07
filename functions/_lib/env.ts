import type { SharedList } from "../../state-worker/shared-list";
import { parseAllowlist, requireNonEmptyConfig, validateGroupName } from "../../shared/validation";

export interface PagesEnv {
  readonly LIST: DurableObjectNamespace<SharedList>;
  readonly APP_ORIGIN: string;
  readonly GROUP_DISPLAY_NAME?: string;
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly ALLOWED_EMAILS: string;
  readonly SESSION_ENCRYPTION_KEY: string;
}

export interface AppConfig {
  readonly appOrigin: string;
  readonly groupName: string;
  readonly googleClientId: string;
  readonly googleClientSecret: string;
  readonly allowedEmails: ReadonlySet<string>;
  readonly sessionEncryptionKey: string;
}

export function getConfig(env: PagesEnv): AppConfig {
  const origin = requireNonEmptyConfig(env.APP_ORIGIN, "APP_ORIGIN");
  const parsedOrigin = new URL(origin);
  if (parsedOrigin.origin !== origin || !["http:", "https:"].includes(parsedOrigin.protocol)) {
    throw new Error("APP_ORIGIN must be an exact HTTP origin");
  }
  return {
    appOrigin: origin,
    groupName: validateGroupName(env.GROUP_DISPLAY_NAME),
    googleClientId: requireNonEmptyConfig(env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID"),
    googleClientSecret: requireNonEmptyConfig(env.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET"),
    allowedEmails: parseAllowlist(requireNonEmptyConfig(env.ALLOWED_EMAILS, "ALLOWED_EMAILS")),
    sessionEncryptionKey: requireNonEmptyConfig(env.SESSION_ENCRYPTION_KEY, "SESSION_ENCRYPTION_KEY"),
  };
}
