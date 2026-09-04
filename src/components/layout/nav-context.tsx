"use client";

import { createContext, useContext } from "react";
import type { NavCatalogCategory } from "@/lib/products/products";

const NavCtx = createContext<NavCatalogCategory[]>([]);

export function NavProvider({
  catalog,
  children,
}: {
  catalog: NavCatalogCategory[];
  children: React.ReactNode;
}) {
  return <NavCtx.Provider value={catalog}>{children}</NavCtx.Provider>;
}

/** Storefront categories with their products, for the navbar. */
export function useNavCatalog(): NavCatalogCategory[] {
  return useContext(NavCtx);
}

/** Categories only (name + href) — convenience for callers that don't need products. */
export function useNavCategories(): { name: string; href: string }[] {
  return useContext(NavCtx).map((c) => ({ name: c.name, href: c.href }));
}
