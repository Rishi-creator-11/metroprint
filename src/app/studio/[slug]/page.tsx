import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products/products";
import { isStudioProduct } from "@/lib/studio/print-specs";
import { StudioClient } from "@/components/studio/StudioClient";

export const metadata = { title: "Design Studio" };

export default async function StudioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !isStudioProduct(slug)) notFound();

  const sizeField = product.options_schema.fields.find(
    (f) => f.name === "size" && (f.options?.length ?? 0) > 0,
  );
  const sidesField = product.options_schema.fields.find(
    (f) => f.name === "sides" || f.name === "printed_sides",
  );

  return (
    <StudioClient
      product={{
        slug: product.slug,
        title: product.title,
        category: product.category,
        image_url: product.image_url,
        print_specs: product.print_specs ?? {},
      }}
      sizeOptions={sizeField?.options ?? []}
      sidesOptions={sidesField?.options ?? []}
    />
  );
}
