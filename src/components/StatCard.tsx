import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: "terracotta" | "sage" | "rose" | "brique";
  loading?: boolean;
}

const ACCENTS: Record<
  NonNullable<StatCardProps["accent"]>,
  { bg: string; fg: string }
> = {
  terracotta: { bg: "bg-[#c76b49]/12", fg: "text-[#c76b49]" },
  sage: { bg: "bg-[#a9b49a]/20", fg: "text-[#5f6b50]" },
  rose: { bg: "bg-[#e5a78f]/20", fg: "text-[#b9694f]" },
  brique: { bg: "bg-[#9b4a2d]/12", fg: "text-[#9b4a2d]" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "terracotta",
  loading,
}: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <Card className="gap-0 py-5">
      <div className="flex items-start justify-between px-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-9 w-16" />
          ) : (
            <p className="font-serif text-4xl font-semibold leading-none tracking-tight">
              {value}
            </p>
          )}
          {hint && !loading && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            a.bg,
          )}
        >
          <Icon className={cn("size-5", a.fg)} />
        </div>
      </div>
    </Card>
  );
}
