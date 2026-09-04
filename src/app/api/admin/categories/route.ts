import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/admin-server";

const COLS = "id, name, slug, description, image_url, sort_order, visible, created_at";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { data, error } = await auth.service
    .from("categories")
    .select(COLS)
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim().toLowerCase()
      : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Slug must be lowercase-with-hyphens" }, { status: 400 });
  }

  const { data: maxRow } = await service
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await service
    .from("categories")
    .insert({
      name,
      slug,
      description: typeof body.description === "string" ? body.description : "",
      image_url:
        typeof body.image_url === "string" && body.image_url.trim()
          ? body.image_url.trim()
          : null,
      sort_order:
        Number.isFinite(Number(body.sort_order))
          ? Math.trunc(Number(body.sort_order))
          : (maxRow?.sort_order ?? 0) + 1,
      visible: typeof body.visible === "boolean" ? body.visible : true,
    })
    .select(COLS)
    .single();

  if (error) {
    const status = error.message.includes("duplicate") ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json(data);
}
