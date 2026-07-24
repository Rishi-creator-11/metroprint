import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus | string;
  className?: string;
}) {
  const style =
    statusStyles[status as OrderStatus] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
