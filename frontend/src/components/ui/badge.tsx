import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border", {
  variants: {
    variant: {
      default: "border-slate-700 bg-slate-800 text-slate-300",
      success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      destructive: "border-red-500/30 bg-red-500/10 text-red-400",
      info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
