import { cn } from "@/lib/utils.js";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "textarea textarea-bordered rounded-lg min-h-[220px] w-full bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-ring",
        className
      )}
      {...props}
    />
  );
}
