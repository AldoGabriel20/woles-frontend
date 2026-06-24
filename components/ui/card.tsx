import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children: ReactNode;
}

export function Card({
  hoverable = false,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-outline-variant bg-surface-container-lowest p-4",
        hoverable ? "transition-shadow hover:shadow-md cursor-pointer" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
