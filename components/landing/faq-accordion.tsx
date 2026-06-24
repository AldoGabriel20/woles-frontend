"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-outline-variant rounded-2xl border border-outline-variant bg-surface-container-lowest">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="font-display text-label-lg text-on-surface">{item.q}</span>
            <ChevronDown
              size={18}
              className={[
                "shrink-0 text-on-surface-variant transition-transform duration-200",
                open === i ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4">
              <p className="text-label-md text-on-surface-variant">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
