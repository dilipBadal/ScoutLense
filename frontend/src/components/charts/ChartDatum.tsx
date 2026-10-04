import { useId, useState, type ReactNode } from "react";

/** Shared mouse, touch and keyboard inspection for chart marks. */
export function ChartDatum({
  label,
  detail,
  children,
}: {
  label: string;
  detail: string;
  children: ReactNode;
}) {
  const id = useId();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pinned, setPinned] = useState(false);
  const visible = hover || focus || pinned;
  return (
    <div
      className="chart-datum"
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-expanded={visible}
      aria-describedby={visible ? id : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onClick={() => setPinned(!pinned)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setPinned(!pinned);
        }
        if (e.key === "Escape") {
          e.stopPropagation();
          setPinned(false);
          setHover(false);
          setFocus(false);
        }
      }}
    >
      {children}
      {visible && (
        <span className="chart-tooltip" id={id} role="tooltip">
          {detail}
        </span>
      )}
    </div>
  );
}
