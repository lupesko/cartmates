import { useState, type FormEvent } from "react";

interface Props {
  readonly pending: boolean;
  readonly onAdd: (text: string) => Promise<boolean>;
}

export function AddItemForm({ pending, onAdd }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) { setError("Enter an item name"); return; }
    if (/[\r\n]/u.test(text)) { setError("Item names must use one line"); return; }
    if ([...trimmed].length > 200) { setError("Item names can be at most 200 characters"); return; }
    setError(undefined);
    if (await onAdd(text)) setText("");
  }

  return (
    <form className="add-form" onSubmit={(event) => { void submit(event); }}>
      <div className="add-form__field">
        <label className="sr-only" htmlFor="new-item">Add a grocery item</label>
        <input
          id="new-item"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add an item…"
          autoComplete="off"
          enterKeyHint="done"
          maxLength={201}
          aria-describedby={error === undefined ? undefined : "new-item-error"}
          aria-invalid={error !== undefined}
          disabled={pending}
        />
        <span className="sr-only" aria-live="polite">{[...text.trim()].length} of 200 characters</span>
      </div>
      <button className="add-form__button" type="submit" aria-label="Add item" disabled={pending}>
        <img src="/assets/icons/plus.svg" alt="" aria-hidden="true" />
      </button>
      {error !== undefined && <p id="new-item-error" className="field-error" role="alert">{error}</p>}
    </form>
  );
}
