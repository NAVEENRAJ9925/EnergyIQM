import { cn } from "@/lib/utils";
import { AnalyticsCard } from "@/components/AnalyticsCard";

export function ChartCard({
  title,
  subtitle,
  right,
  children,
  className,
  accent,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accent?: "emerald" | "sky" | "amber" | "rose" | "violet";
}) {
  return (
    <AnalyticsCard className={className} accent={accent}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90 dark:bg-emerald-300/90" />
            <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
          </div>
          {subtitle ? (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className={cn("h-64 sm:h-72", accent ? "" : "")}>{children}</div>
    </AnalyticsCard>
  );
}

