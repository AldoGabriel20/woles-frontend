type BadgeColor = "green" | "blue" | "amber" | "red" | "grey" | "teal" | "primary";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  color?: BadgeColor;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const COLOR_CLASSES: Record<BadgeColor, string> = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  grey: "bg-surface-container text-on-surface-variant",
  teal: "bg-teal-100 text-teal-800",
  primary: "bg-primary/10 text-primary",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-label-sm",
};

export function Badge({
  color = "grey",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-medium leading-none",
        COLOR_CLASSES[color],
        SIZE_CLASSES[size],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
