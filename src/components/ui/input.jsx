import { cn } from "@/lib/utils.js";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "input input-bordered h-8 w-full bg-input/70 px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-ring",
        className
      )}
      {...props}
    />
  );
}
