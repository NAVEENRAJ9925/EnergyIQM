import { cn } from "@/lib/utils";

export function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        autoComplete={autoComplete}
        className={cn(
          "peer w-full h-12 px-4 pt-5 pb-2 rounded-xl",
          "bg-slate-900/80 border border-slate-700/70 text-white",
          "placeholder:text-slate-400/80",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-cyan-500/40",
          "transition-all duration-300 ease-in-out",
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-4 top-3.5 text-sm text-slate-400 pointer-events-none",
          "transition-all duration-200",
          "peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-cyan-300",
          "peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:text-slate-300",
        )}
      >
        {label}
      </label>
    </div>
  );
}

