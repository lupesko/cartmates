import { useEffect, useRef } from "react";

interface Props {
  readonly kind: "clear" | "bought";
  readonly itemCount: number;
  readonly pending: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmationDialog({ kind, itemCount, pending, onConfirm, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    confirm.current?.focus();
    return () => {
      element?.close();
      opener?.focus();
    };
  }, []);
  const bought = kind === "bought";
  return (
    <dialog ref={dialog} className="confirm-dialog" aria-labelledby="confirm-title" onCancel={(event) => { event.preventDefault(); if (!pending) onCancel(); }}>
      <div className="confirm-dialog__sheet">
        <button className="confirm-dialog__close icon-button" type="button" aria-label="Close confirmation" onClick={onCancel} disabled={pending}>×</button>
        <img className="confirm-dialog__art" src={bought ? "/assets/illustrations/cart-bought.svg" : "/assets/illustrations/cart-empty.svg"} alt="" aria-hidden="true" />
        <h2 id="confirm-title">{bought ? "Mark all items as bought?" : "Clear your list?"}</h2>
        <p>This will remove all {itemCount} {itemCount === 1 ? "item" : "items"} from your list.</p>
        <button ref={confirm} className={`confirm-dialog__primary ${bought ? "confirm-dialog__primary--green" : "confirm-dialog__primary--red"}`} type="button" onClick={onConfirm} disabled={pending}>
          {pending ? "Saving…" : bought ? "Yes, mark all as bought" : "Yes, clear the list"}
        </button>
        <button className="confirm-dialog__cancel" type="button" onClick={onCancel} disabled={pending}>Cancel</button>
      </div>
    </dialog>
  );
}
