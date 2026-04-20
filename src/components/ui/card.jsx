import { cn } from "@/lib/utils.js";

export function Card({ className, ...props }) {
  return <div className={cn("card bg-base-100 border border-border/25 shadow-sm", className)} {...props} />;
}
