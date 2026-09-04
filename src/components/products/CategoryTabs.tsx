"use client";

import Link from "next/link";
import { useRef } from "react";

export function CategoryTabs({
  categories,
  active,
}: {
  categories: { name: string; href: string }[];
  active: string | null;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const tab = (isActive: boolean) =>
    `shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
      isActive
        ? "bg-primary text-white shadow-sm"
        : "bg-white text-muted ring-1 ring-border hover:text-navy hover:ring-primary/40"
    }`;

  return (
    <div
      ref={scroller}
      className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link href="/products" className={tab(!active)}>
        All
      </Link>
      {categories.map((c) => (
        <Link key={c.name} href={c.href} className={tab(active === c.name)}>
          {c.name}
        </Link>
      ))}
    </div>
  );
}
