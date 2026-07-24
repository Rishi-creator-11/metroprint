import { createServiceClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin-server";
import { AdminRequestDetail } from "@/components/admin/AdminRequestDetail";
import { normalizeOrder } from "@/lib/quote-normalize";
import { notFound } from "next/navigation";

export default async function AdminRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminUser();
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return <AdminRequestDetail request={normalizeOrder(data)} />;
}
