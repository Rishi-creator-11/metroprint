import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/admin-server";

const COLS = "id, name, slug, description, image_url, sort_order, visible, created_at";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.description === "string") updates.description = body.description;
  if (typeof body.image_url === "string") updates.image_url = body.image_url.trim() || null;
  if (typeof body.visible === "boolean") updates.visible = body.visible;
  if (body.sort_order !== undefined && Number.isFinite(Number(body.sort_order))) {
    updates.sort_order = Math.trunc(Number(body.sort_order));
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }

  const { data, error } = await service
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * "Delete" hides the category (visible = false) unless ?hard=true is passed AND
 * no active product uses it. Products are never touched.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const hard = new URL(request.url).searchParams.get("hard") === "true";

  const { data: cat } = await service
    .from("categories")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (hard) {
    const { count } = await service
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", cat.name);
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: `${count} product(s) still use "${cat.name}". Hidden instead.` },
        { status: 409 },
      );
    }
    const { error } = await service.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
  }

  const { data, error } = await service
    .from("categories")
    .update({ visible: false })
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
