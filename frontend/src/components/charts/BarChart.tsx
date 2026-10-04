import { ChartDatum } from "./ChartDatum";
import { useId } from "react";
export type BarItem = { label: string; value: number | null; note?: string };
export function BarChart({
  title,
  items,
  max = 100,
  unit = "",
  reference,
}: {
  title: string;
  items: BarItem[];
  max?: number;
  unit?: string;
  reference?: number | null;
}) {
  const id = useId();
  const scale = Math.max(1, max);
  return (
    <figure className="bar-chart" aria-labelledby={id}>
      <figcaption id={id}>{title}</figcaption>
      <div className="bar-axis" aria-hidden="true">
        <span>0{unit}</span>
        <span>
          {(scale / 2).toFixed(0)}
          {unit}
        </span>
        <span>
          {scale.toFixed(0)}
          {unit}
        </span>
      </div>
      {items.map((item) => (
        <ChartDatum
          key={item.label}
          label={`${item.label} chart details`}
          detail={`${item.label}: ${item.value === null ? "No data" : item.value.toFixed(1) + unit}${item.note ? " · " + item.note : ""}${reference != null ? " · Reference: " + reference + unit : ""}`}
        >
          <div className="bar-row">
            <div className="bar-label">
              <span>{item.label}</span>
              <strong>
                {item.value === null
                  ? "No data"
                  : `${item.value.toFixed(1)}${unit}`}
              </strong>
            </div>
            <div className="bar-track" aria-hidden="true">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.max(0, Math.min(100, ((item.value ?? 0) / scale) * 100))}%`,
                }}
              />
              {reference != null && (
                <i
                  className="bar-reference"
                  style={{
                    left: `${Math.max(0, Math.min(100, (reference / scale) * 100))}%`,
                  }}
                />
              )}
            </div>
            {item.note && <small>{item.note}</small>}
          </div>
        </ChartDatum>
      ))}
    </figure>
  );
}
