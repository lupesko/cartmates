import { useCallback, useEffect, useRef, useState } from "react";
import type { ListResponse } from "../../shared/api-contracts";
import type { ListUiState } from "../app/state";
import { ApiError, getList, mutate, NotModified, operation, type MutationRequest } from "../lib/api-client";

const POLL_INTERVAL_MS = 3_000;

export interface SharedListActions {
  readonly state: ListUiState;
  readonly add: (text: string) => Promise<boolean>;
  readonly markBought: (id: string) => Promise<void>;
  readonly remove: (id: string) => Promise<void>;
  readonly clear: () => Promise<void>;
  readonly markAllBought: () => Promise<void>;
  readonly retry: () => Promise<void>;
  readonly refresh: () => Promise<void>;
}

export function useSharedList(csrfToken: string): SharedListActions {
  const [list, setList] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<ListUiState["message"]>(null);
  const [retryRequest, setRetryRequest] = useState<MutationRequest | null>(null);
  const etag = useRef<string | undefined>(undefined);
  const mounted = useRef(true);
  const refreshController = useRef<AbortController | null>(null);
  const refreshInFlight = useRef<Promise<void> | null>(null);

  const refresh = useCallback((): Promise<void> => {
    if (refreshInFlight.current !== null) return refreshInFlight.current;
    const controller = new AbortController();
    refreshController.current = controller;
    const request = (async () => {
      try {
        const response = await getList(etag.current, controller.signal);
        if (!mounted.current) return;
        etag.current = response.etag ?? `"${response.list.revision}"`;
        setList(response.list);
        setMessage((current) => current?.tone === "error" ? null : current);
      } catch (error) {
        if (error instanceof NotModified) return;
        if (!mounted.current || (error instanceof DOMException && error.name === "AbortError")) return;
        if (error instanceof ApiError && error.status === 401) window.location.reload();
        setMessage({ tone: "error", text: error instanceof Error ? error.message : "Could not refresh the list." });
      } finally {
        refreshController.current = null;
        refreshInFlight.current = null;
        if (mounted.current) setLoading(false);
      }
    })();
    refreshInFlight.current = request;
    return request;
  }, []);

  useEffect(() => {
    mounted.current = true;
    let timeout: number | undefined;
    let stopped = false;
    const poll = async () => {
      if (!stopped && document.visibilityState === "visible") await refresh();
      if (!stopped) timeout = window.setTimeout(() => { void poll(); }, POLL_INTERVAL_MS);
    };
    const wake = () => { if (document.visibilityState === "visible") void refresh(); };
    void poll();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    window.addEventListener("online", wake);
    return () => {
      stopped = true;
      mounted.current = false;
      refreshController.current?.abort();
      if (timeout !== undefined) window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("online", wake);
    };
  }, [refresh]);

  const execute = useCallback(async (request: MutationRequest): Promise<boolean> => {
    setPendingAction(request.path);
    setMessage({ tone: "info", text: "Saving…" });
    try {
      const response = await mutate(request, csrfToken);
      if (!mounted.current) return false;
      setList(response.list);
      etag.current = `"${response.list.revision}"`;
      setRetryRequest(null);
      setMessage({ tone: "success", text: response.alreadyProcessed ? "Already saved." : "Saved." });
      return true;
    } catch (error) {
      if (!mounted.current) return false;
      if (error instanceof ApiError && error.status === 401) window.location.reload();
      setRetryRequest(request);
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Could not save. Try again." });
      return false;
    } finally {
      if (mounted.current) setPendingAction(null);
    }
  }, [csrfToken]);

  const add = useCallback((text: string) => execute(operation("/api/items", "POST", { text })), [execute]);
  const markBought = useCallback(async (id: string) => { await execute(operation(`/api/items/${encodeURIComponent(id)}/bought`)); }, [execute]);
  const remove = useCallback(async (id: string) => { await execute(operation(`/api/items/${encodeURIComponent(id)}`, "DELETE")); }, [execute]);
  const clear = useCallback(async () => { await execute(operation("/api/list/clear")); }, [execute]);
  const markAllBought = useCallback(async () => { await execute(operation("/api/list/mark-all-bought")); }, [execute]);
  const retry = useCallback(async () => { if (retryRequest !== null) await execute(retryRequest); }, [execute, retryRequest]);

  return {
    state: { list, loading, pendingAction, message, retryAvailable: retryRequest !== null },
    add, markBought, remove, clear, markAllBought, retry, refresh,
  };
}
