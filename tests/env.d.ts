import type { SharedList } from "../state-worker/shared-list";

declare global {
  namespace Cloudflare {
    interface Env {
      LIST: DurableObjectNamespace<SharedList>;
      APP_ORIGIN: string;
      GROUP_DISPLAY_NAME?: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      ALLOWED_EMAILS: string;
      SESSION_ENCRYPTION_KEY: string;
    }
  }
}

export {};
