import { cn } from "@/lib/utils.js";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "input input-bordered rounded-lg h-8 w-full bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-ring",
        className
      )}
      {...props}
    />
  );
}
