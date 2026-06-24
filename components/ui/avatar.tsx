import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE_PX: Record<AvatarSize, number> = { sm: 32, md: 48, lg: 80 };

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-label-sm",
  md: "h-12 w-12 text-label-md",
  lg: "h-20 w-20 text-title-lg",
};

// Deterministic color from name
function colorFromName(name: string): string {
  const COLORS = [
    "bg-teal-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-green-600",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return COLORS[hash % COLORS.length];
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const px = SIZE_PX[size];
  const sizeClass = SIZE_CLASSES[size];

  if (src) {
    return (
      <div className={["relative overflow-hidden rounded-full shrink-0", sizeClass, className].join(" ")}>
        <Image src={src} alt={name ?? "Avatar"} width={px} height={px} className="h-full w-full object-cover" />
      </div>
    );
  }

  const displayName = name ?? "?";
  const bg = colorFromName(displayName);

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white",
        bg,
        sizeClass,
        className,
      ].join(" ")}
      aria-label={displayName}
    >
      {initials(displayName)}
    </div>
  );
}
