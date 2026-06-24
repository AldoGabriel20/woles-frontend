import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  cta?: ReactNode;
  icon?: string;
}

export function EmptyState({ title, description, cta, icon = "📭" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="mb-4 text-5xl" role="img" aria-hidden>
        {icon}
      </span>
      <h3 className="mb-1 font-display text-title-md text-on-surface">{title}</h3>
      {description && (
        <p className="mb-4 max-w-xs text-label-md text-on-surface-variant">{description}</p>
      )}
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}
