import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-red-100 text-red-800",
};

export function PaymentBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        paymentStyles[status],
        className
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
