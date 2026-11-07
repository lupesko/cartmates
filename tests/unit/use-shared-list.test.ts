import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getList, mutate, operation } from "../../src/lib/api-client";
import { useSharedList } from "../../src/hooks/useSharedList";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
});

function listResponse(revision = 0): Response {
  return new Response(JSON.stringify({ revision, items: [], remainingCount: 0, groupName: "Our Groceries" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ETag: `"${revision}"` },
  });
}

describe("authoritative API client", () => {
  it("sends revision ETags for conditional list reads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ revision: 2, items: [], remainingCount: 0, groupName: "Our Groceries" }), { status: 200, headers: { "Content-Type": "application/json", ETag: '"2"' } }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await getList('"1"');
    expect(result.etag).toBe('"2"');
    expect(((fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Headers).get("If-None-Match")).toBe('"1"');
  });

  it("reuses the caller-owned idempotency key for uncertain retries", async () => {
    const response = { outcome: "applied", alreadyProcessed: false, list: { revision: 1, items: [], remainingCount: 0, groupName: "Our Groceries" } };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const request = operation("/api/list/clear");
    await mutate(request, "x".repeat(32));
    await mutate(request, "x".repeat(32));
    const keys = fetchMock.mock.calls.map((call) => (call[1] as RequestInit).headers as Headers).map((headers) => headers.get("Idempotency-Key"));
    expect(keys).toEqual([request.operationId, request.operationId]);
  });

  it("polls sequentially every three seconds without overlapping requests", async () => {
    vi.useFakeTimers();
    let finish: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { finish = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    renderHook(() => useSharedList("x".repeat(32)));
    await act(async () => { await Promise.resolve(); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(6_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => { finish?.(listResponse()); await Promise.resolve(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(3_000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("aborts an in-flight read when the view unmounts", async () => {
    let observedSignal: AbortSignal | undefined;
    const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      observedSignal = init.signal instanceof AbortSignal ? init.signal : undefined;
      return new Promise<Response>(() => undefined);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = renderHook(() => useSharedList("x".repeat(32)));
    await act(async () => { await Promise.resolve(); });
    unmount();
    expect(observedSignal?.aborted).toBe(true);
  });

  it("pauses while hidden and wakes on visibility, focus, and online events", async () => {
    vi.useFakeTimers();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    const fetchMock = vi.fn().mockResolvedValue(listResponse());
    vi.stubGlobal("fetch", fetchMock);
    renderHook(() => useSharedList("x".repeat(32)));
    await act(async () => { await vi.advanceTimersByTimeAsync(3_000); });
    expect(fetchMock).not.toHaveBeenCalled();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    await act(async () => { document.dispatchEvent(new Event("visibilitychange")); await Promise.resolve(); });
    await act(async () => { window.dispatchEvent(new Event("focus")); await Promise.resolve(); });
    await act(async () => { window.dispatchEvent(new Event("online")); await Promise.resolve(); });
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
