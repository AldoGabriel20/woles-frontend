"use client";

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
}

const ICONS: { value: string; emoji: string; label: string }[] = [
  { value: "love", emoji: "❤️", label: "Love" },
  { value: "emergency", emoji: "🚨", label: "Emergency" },
  { value: "vehicle", emoji: "🚗", label: "Vehicle" },
  { value: "home", emoji: "🏠", label: "Home" },
  { value: "travel", emoji: "✈️", label: "Travel" },
  { value: "other", emoji: "⭐", label: "Other" },
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Choose icon">
      {ICONS.map((icon) => (
        <button
          key={icon.value}
          type="button"
          role="radio"
          aria-checked={value === icon.value}
          aria-label={icon.label}
          onClick={() => onChange(icon.value)}
          className={[
            "flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all",
            value === icon.value
              ? "border-2 border-primary bg-primary/10 ring-2 ring-primary/30"
              : "border border-outline-variant bg-surface-container hover:border-primary/40",
          ].join(" ")}
        >
          {icon.emoji}
        </button>
      ))}
    </div>
  );
}

export function iconToEmoji(value?: string): string {
  return ICONS.find((i) => i.value === value)?.emoji ?? "⭐";
}
