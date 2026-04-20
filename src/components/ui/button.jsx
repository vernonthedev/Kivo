import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils.js";

const buttonVariants = cva(
  "btn no-animation min-h-0 font-medium transition-colors disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "btn-primary text-primary-foreground",
        secondary: "btn-secondary",
        ghost: "btn-ghost text-muted-foreground hover:text-accent-foreground",
        outline: "btn-outline border-border/50 hover:bg-accent"
      },
      size: {
        default: "h-8 px-3 btn-sm",
        sm: "h-7 px-2.5 btn-xs text-[11px]",
        icon: "h-8 w-8 btn-square btn-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
