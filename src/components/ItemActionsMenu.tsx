import { useEffect, useRef, useState } from "react";

interface Props {
  readonly itemName: string;
  readonly disabled: boolean;
  readonly onRemove: () => void;
}

export function ItemActionsMenu({ itemName, disabled, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <div className="item-menu">
      <button ref={button} className="icon-button" type="button" aria-label={`Actions for ${itemName}`} aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={() => setOpen((value) => !value)}>
        <img src="/assets/icons/more.svg" alt="" aria-hidden="true" />
      </button>
      {open && (
        <div className="item-menu__popup" role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onRemove(); }}>
            <img src="/assets/icons/trash.svg" alt="" aria-hidden="true" /> Remove
          </button>
        </div>
      )}
    </div>
  );
}
