import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  MAX_ARTWORK_FILES,
  sanitizeFilename,
  validateArtworkFile,
} from "@/lib/artwork";

export async function POST(request: Request) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to upload artwork" }, { status: 401 });
    }

    const formData = await request.formData();
    const uploadId = (formData.get("upload_id") as string)?.trim();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (!uploadId || uploadId.length > 64) {
      return NextResponse.json({ error: "Invalid upload session" }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_ARTWORK_FILES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_ARTWORK_FILES} files at a time.` },
        { status: 400 }
      );
    }

    for (const file of files) {
      const validationError = validateArtworkFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    const supabase = await createServiceClient();
    const uploaded: { name: string; url: string }[] = [];

    for (const file of files) {
      const safeName = sanitizeFilename(file.name);
      const path = `artwork/${user.id}/${uploadId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("quote-artwork")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        console.error("Artwork upload error:", uploadError);
        return NextResponse.json({ error: "Failed to upload artwork" }, { status: 500 });
      }

      const { data } = supabase.storage.from("quote-artwork").getPublicUrl(path);
      uploaded.push({ name: file.name, url: data.publicUrl });
    }

    return NextResponse.json({ files: uploaded });
  } catch (err) {
    console.error("Upload artwork error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
