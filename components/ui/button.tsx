import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary shadow-sm hover:brightness-110 disabled:opacity-50",
  secondary:
    "bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-container-low disabled:opacity-50",
  ghost:
    "bg-transparent text-primary hover:bg-primary/10 disabled:opacity-50",
  danger:
    "bg-error text-white shadow-sm hover:brightness-110 disabled:opacity-50",
  outline:
    "bg-transparent text-on-surface border border-outline hover:bg-surface-container disabled:opacity-50",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-label-sm gap-1.5",
  md: "h-10 px-4 text-label-md gap-2",
  lg: "h-12 px-5 text-label-lg gap-2",
};

function Spinner({ size }: { size: Size }) {
  const s = size === "sm" ? 12 : size === "md" ? 14 : 16;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="animate-spin"
      aria-hidden
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <Spinner size={size} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
