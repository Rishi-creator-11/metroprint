import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/admin-server";

const BUCKET = "product-images";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

/** Upload a product/category image to Supabase Storage; returns its public URL. */
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const form = await request.formData();
  const file = form.get("file");
  const folder = (form.get("folder") as string) || "products";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 8 MB" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Use PNG, JPG, WebP, GIF, or SVG" },
      { status: 400 },
    );
  }

  const safeFolder = folder.replace(/[^a-z0-9/-]/gi, "").slice(0, 40) || "products";
  const ext = EXT[file.type] ?? "bin";
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await service.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = service.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
