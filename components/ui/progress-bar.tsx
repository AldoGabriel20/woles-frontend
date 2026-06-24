interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  showLabel?: boolean;
  className?: string;
  height?: string;
}

export function ProgressBar({
  value,
  color = "bg-primary",
  showLabel = false,
  className = "",
  height = "h-2",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={["flex flex-col gap-1", className].join(" ")}>
      {showLabel && (
        <div className="flex justify-end">
          <span className="text-label-sm text-on-surface-variant">{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className={["w-full overflow-hidden rounded-full bg-surface-container", height].join(" ")}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={["h-full rounded-full transition-all duration-700", color].join(" ")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
