import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  label,
  subtle = true,
}: {
  status: "online" | "offline" | "warning";
  label: string;
  subtle?: boolean;
}) {
  const map = {
    online: {
      dot: "bg-emerald-400",
      text: "text-emerald-300 dark:text-emerald-200",
      bg: subtle ? "bg-emerald-500/10" : "bg-emerald-500/15",
      border: "border-emerald-500/25",
    },
    offline: {
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-300",
      bg: subtle ? "bg-slate-500/10" : "bg-slate-500/15",
      border: "border-slate-500/25",
    },
    warning: {
      dot: "bg-amber-400",
      text: "text-amber-600 dark:text-amber-200",
      bg: subtle ? "bg-amber-500/10" : "bg-amber-500/15",
      border: "border-amber-500/25",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        map.bg,
        map.border,
        map.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} />
      {label}
    </span>
  );
}

