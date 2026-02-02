import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

const statCardVariants = cva(
  "relative overflow-hidden rounded-lg border p-4 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border-border hover:border-primary/50",
        primary: "bg-card border-primary/30 hover:border-primary shadow-[0_0_15px_hsl(var(--primary)/0.1)]",
        gold: "bg-card border-gold/30 hover:border-gold shadow-[0_0_15px_hsl(var(--gold)/0.1)]",
        success: "bg-card border-success/30 hover:border-success shadow-[0_0_15px_hsl(var(--success)/0.1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
}

export function StatCard({
  className,
  variant,
  icon: Icon,
  label,
  value,
  subValue,
  ...props
}: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ variant }), className)} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold font-display mt-1">{value}</p>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-secondary">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
