import { cn } from "@/lib/utils.js";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "textarea textarea-bordered min-h-[220px] w-full rounded-sm bg-input/45 px-3 py-2.5 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-ring",
        className
      )}
      {...props}
    />
  );
}
