import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  titleAccent,
  description,
  right,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  titleAccent?: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
        <h1 className="t-page-title text-foreground">
          {title} {titleAccent ? <span>{titleAccent}</span> : null}
        </h1>
        {description ? <p className="mt-2 t-body text-muted-foreground">{description}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

