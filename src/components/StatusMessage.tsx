interface Props {
  readonly tone: "success" | "error" | "info";
  readonly children: string;
  readonly onRetry?: () => void;
}

export function StatusMessage({ tone, children, onRetry }: Props) {
  return (
    <div className={`status status--${tone}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"}>
      <span>{children}</span>
      {onRetry !== undefined && <button className="status__retry" type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}
