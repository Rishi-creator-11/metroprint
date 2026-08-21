import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ProductCategory } from "@/lib/types";

interface CategoryCardProps {
  name: ProductCategory | string;
  description: string;
  image: string;
  href?: string;
}

export function CategoryCard({ name, description, image, href }: CategoryCardProps) {
  const resolvedHref = href ?? `/products?category=${encodeURIComponent(name)}`;

  return (
    <Link
      href={resolvedHref}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-36 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 20vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-navy">{name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted">{description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2">
          Browse <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
