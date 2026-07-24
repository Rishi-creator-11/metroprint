import { cn } from "@/lib/utils";

export function TypeBadge({
  type,
  className,
}: {
  type: "order" | "inquiry";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        type === "inquiry"
          ? "bg-violet-100 text-violet-800"
          : "bg-blue-100 text-blue-800",
        className
      )}
    >
      {type === "inquiry" ? "Inquiry" : "Order"}
    </span>
  );
}
