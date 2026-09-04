import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ProductCategory } from "@/lib/types";

interface CategoryCardProps {
  name: ProductCategory | string;
  description: string;
  image: string;
  href?: string;
  count?: number;
}

export function CategoryCard({ name, description, image, href, count }: CategoryCardProps) {
  const resolvedHref = href ?? `/products?category=${encodeURIComponent(name)}`;

  return (
    <Link
      href={resolvedHref}
      className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
    >
      <div className="relative h-40 overflow-hidden bg-surface">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted">{name}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/45 to-transparent" />
        {count != null && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-navy">
            {count} {count === 1 ? "product" : "products"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-navy">{name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted">{description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
          Shop {name} <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
