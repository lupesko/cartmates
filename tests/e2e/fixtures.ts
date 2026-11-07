import type { Page, Route } from "@playwright/test";
import type { GroceryItem } from "../../shared/api-contracts";

export interface MockState {
  groupName: string;
  revision: number;
  items: GroceryItem[];
  signedIn: boolean;
  failNextMutation?: boolean;
}

export function state(items: GroceryItem[] = []): MockState {
  return { groupName: "Our Groceries", revision: 0, items: [...items], signedIn: true };
}

function json(route: Route, body: unknown, status = 200, headers?: Record<string, string>) {
  return route.fulfill({ status, contentType: "application/json", headers: { "Cache-Control": "no-store", ...headers }, body: JSON.stringify(body) });
}

function listBody(value: MockState) {
  return { revision: value.revision, items: value.items, remainingCount: value.items.length, groupName: value.groupName };
}

export async function mockCartmates(page: Page, value: MockState): Promise<void> {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/api/session") {
      if (!value.signedIn) return json(route, { error: { code: "unauthenticated", message: "Please sign in to continue.", retryable: false } }, 401);
      return json(route, { user: { displayName: "Hagay", initials: "HL" }, groupName: value.groupName, csrfToken: "x".repeat(32) });
    }
    if (!value.signedIn) return json(route, { error: { code: "unauthenticated", message: "Please sign in to continue.", retryable: false } }, 401);
    if (url.pathname === "/api/list" && request.method() === "GET") {
      if (request.headers()["if-none-match"] === `"${value.revision}"`) return route.fulfill({ status: 304, headers: { "Cache-Control": "no-store", ETag: `"${value.revision}"` } });
      return json(route, listBody(value), 200, { ETag: `"${value.revision}"` });
    }
    if (url.pathname === "/api/auth/logout") { value.signedIn = false; return route.fulfill({ status: 204 }); }
    if (value.failNextMutation) {
      value.failNextMutation = false;
      return route.abort("internetdisconnected");
    }
    let outcome: "applied" | "already_absent" | "already_empty" = "applied";
    if (url.pathname === "/api/items" && request.method() === "POST") {
      const payload = request.postDataJSON() as { text: string };
      value.items.push({ id: crypto.randomUUID(), text: payload.text.trim(), creatorName: "Hagay" });
    } else if (/^\/api\/items\/[^/]+\/bought$/u.test(url.pathname) || (request.method() === "DELETE" && /^\/api\/items\/[^/]+$/u.test(url.pathname))) {
      const parts = url.pathname.split("/");
      const id = parts[3]!;
      const before = value.items.length;
      value.items = value.items.filter((item) => item.id !== id);
      if (before === value.items.length) outcome = "already_absent";
    } else if (url.pathname === "/api/list/clear" || url.pathname === "/api/list/mark-all-bought") {
      outcome = value.items.length === 0 ? "already_empty" : "applied";
      value.items = [];
    } else {
      return route.fallback();
    }
    value.revision += 1;
    return json(route, { outcome, alreadyProcessed: false, list: listBody(value) }, 200, { ETag: `"${value.revision}"` });
  });
}
