import { useState } from "react";
import type { SessionResponse } from "../../shared/api-contracts";
import type { SharedListActions } from "../hooks/useSharedList";
import { AddItemForm } from "./AddItemForm";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { EmptyState } from "./EmptyState";
import { GroceryItemRow } from "./GroceryItemRow";
import { StatusMessage } from "./StatusMessage";

interface Props {
  readonly session: SessionResponse;
  readonly list: SharedListActions;
  readonly onSignOut: () => void;
}

export function ShoppingList({ session, list, onSignOut }: Props) {
  const [confirm, setConfirm] = useState<"clear" | "bought" | null>(null);
  const { state } = list;
  const current = state.list;
  const pending = state.pendingAction !== null;
  const count = current?.remainingCount ?? 0;

  async function confirmAction() {
    if (confirm === "clear") await list.clear();
    if (confirm === "bought") await list.markAllBought();
    setConfirm(null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <img src="/assets/brand/cartmates-logo.svg" alt="CartMates" />
        <button className="avatar" type="button" onClick={onSignOut} aria-label={`Sign out ${session.user.displayName}`} title="Sign out">
          {session.user.initials}
        </button>
      </header>

      <section className="list-heading" aria-labelledby="list-title">
        <img src="/assets/icons/group.svg" alt="" aria-hidden="true" />
        <div><h1 id="list-title">{current?.groupName ?? session.groupName}</h1><p>{count} {count === 1 ? "item" : "items"}</p></div>
        <img className="list-heading__rays" src="/assets/illustrations/celebration-rays.svg" alt="" aria-hidden="true" />
      </section>

      {state.message !== null && (
        state.retryAvailable
          ? <StatusMessage tone={state.message.tone} onRetry={() => { void list.retry(); }}>{state.message.text}</StatusMessage>
          : <StatusMessage tone={state.message.tone}>{state.message.text}</StatusMessage>
      )}

      <section className="list-content" aria-busy={state.loading || pending}>
        {state.loading && current === null ? (
          <div className="loading-state" role="status"><img src="/assets/icons/spinner.svg" alt="" />Loading your list…</div>
        ) : current === null || current.items.length === 0 ? <EmptyState /> : (
          <ul className="grocery-list">
            {current.items.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                pending={pending}
                onBought={() => { void list.markBought(item.id); }}
                onRemove={() => { void list.remove(item.id); }}
              />
            ))}
          </ul>
        )}
      </section>

      <footer className="list-controls">
        <AddItemForm pending={pending} onAdd={list.add} />
        <div className="list-actions">
          <button className="list-action list-action--bought" type="button" disabled={pending} onClick={() => setConfirm("bought")}>
            <img src="/assets/icons/check.svg" alt="" aria-hidden="true" /> Mark all bought
          </button>
          <button className="list-action list-action--clear" type="button" disabled={pending} onClick={() => setConfirm("clear")}>
            <img src="/assets/icons/trash.svg" alt="" aria-hidden="true" /> Clear list
          </button>
        </div>
      </footer>

      {confirm !== null && <ConfirmationDialog kind={confirm} itemCount={count} pending={pending} onConfirm={() => { void confirmAction(); }} onCancel={() => setConfirm(null)} />}
    </main>
  );
}
