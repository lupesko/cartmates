import { useEffect, useState } from "react";
import type { SessionState } from "./state";
import { AuthScreen } from "../components/AuthScreen";
import { ShoppingList } from "../components/ShoppingList";
import { useSharedList } from "../hooks/useSharedList";
import { ApiError, getSession, logout } from "../lib/api-client";

function SignedInApp({ state }: { readonly state: Extract<SessionState, { kind: "ready" }> }) {
  const list = useSharedList(state.session.csrfToken);
  async function signOut() {
    try { await logout(state.session.csrfToken); } finally { window.location.assign("/"); }
  }
  return <ShoppingList session={state.session} list={list} onSignOut={() => { void signOut(); }} />;
}

export function App() {
  const denied = new URLSearchParams(window.location.search).get("auth") === "access-denied";
  const [state, setState] = useState<SessionState>({ kind: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    void getSession(controller.signal).then(
      (session) => setState({ kind: "ready", session }),
      (error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) setState({ kind: "signedOut", denied: denied || error.status === 403 });
        else setState({ kind: "error", message: error instanceof Error ? error.message : "CartMates could not start." });
      },
    );
    return () => controller.abort();
  }, [denied]);

  if (state.kind === "loading") return <main className="splash" role="status"><img src="/assets/illustrations/cart-mascot.svg" alt="" /><span>Loading CartMates…</span></main>;
  if (state.kind === "signedOut") return <AuthScreen denied={state.denied} />;
  if (state.kind === "error") return <main className="fatal-error"><h1>We hit a bump</h1><p>{state.message}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></main>;
  return <SignedInApp state={state} />;
}
