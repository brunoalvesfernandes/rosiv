import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressBarVariants = cva(
  "relative h-4 w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        health: "bg-muted",
        energy: "bg-muted",
        xp: "bg-muted",
        gold: "bg-muted",
      },
      size: {
        sm: "h-2",
        default: "h-4",
        lg: "h-6",
      },
    },
    defaultVariants: {
      variant: "health",
      size: "default",
    },
  }
);

const progressFillVariants = cva(
  "h-full transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      variant: {
        health: "bg-health shadow-[0_0_10px_hsl(var(--health)/0.5)]",
        energy: "bg-energy shadow-[0_0_10px_hsl(var(--energy)/0.5)]",
        xp: "bg-xp shadow-[0_0_10px_hsl(var(--xp)/0.5)]",
        gold: "bg-gold shadow-[0_0_10px_hsl(var(--gold)/0.5)]",
      },
    },
    defaultVariants: {
      variant: "health",
    },
  }
);

interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max: number;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  className,
  variant,
  size,
  value,
  max,
  showLabel = true,
  label,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground font-medium">{label}</span>
          <span className="text-foreground font-bold">
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div className={cn(progressBarVariants({ variant, size }), className)} {...props}>
        <div
          className={cn(progressFillVariants({ variant }))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
