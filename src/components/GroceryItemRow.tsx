import type { GroceryItem } from "../../shared/api-contracts";
import { ItemActionsMenu } from "./ItemActionsMenu";

interface Props {
  readonly item: GroceryItem;
  readonly pending: boolean;
  readonly onBought: () => void;
  readonly onRemove: () => void;
}

export function GroceryItemRow({ item, pending, onBought, onRemove }: Props) {
  return (
    <li className={`grocery-item${pending ? " grocery-item--pending" : ""}`}>
      <button className="bought-control" type="button" aria-label={`Mark ${item.text} as bought`} disabled={pending} onClick={onBought}>
        <span aria-hidden="true" />
      </button>
      <div className="grocery-item__copy">
        <span className="grocery-item__name">{item.text}</span>
        <span className="grocery-item__creator">Added by {item.creatorName}</span>
      </div>
      <ItemActionsMenu itemName={item.text} disabled={pending} onRemove={onRemove} />
    </li>
  );
}
