"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

interface Activity {
  id: number;
  name: string;
  qty: string;
  product: string;
  slug: string;
  image: string | null;
}

const ROTATE_MS = 11000;
const FIRST_DELAY_MS = 6000;

export function ActivityPopup() {
  const pathname = usePathname();
  const [events, setEvents] = useState<Activity[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Never on admin / checkout.
  const suppressed =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");
  // On product detail pages a mobile sticky "Add to cart" bar sits at bottom-0.
  const onProductDetail =
    /^\/products\/[^/]+$/.test(pathname) || /^\/business-cards\/[^/]+\/[^/]+$/.test(pathname);

  useEffect(() => {
    if (suppressed) return;
    let cancelled = false;
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.events)) setEvents(d.events);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [suppressed]);

  useEffect(() => {
    if (suppressed || dismissed || events.length === 0) return;
    const showFirst = setTimeout(() => setVisible(true), FIRST_DELAY_MS);
    return () => clearTimeout(showFirst);
  }, [suppressed, dismissed, events.length]);

  useEffect(() => {
    if (!visible || events.length === 0) return;
    const cycle = () => {
      setVisible(false);
      timer.current = setTimeout(() => {
        setIndex((i) => (i + 1) % events.length);
        setVisible(true);
      }, 500);
    };
    const t = setTimeout(cycle, ROTATE_MS);
    return () => {
      clearTimeout(t);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [visible, index, events.length]);

  if (suppressed || dismissed || events.length === 0) return null;
  const e = events[index];

  return (
    <div
      className={`fixed left-4 z-30 max-w-[19rem] transition-all duration-500 ${
        onProductDetail ? "bottom-24 lg:bottom-4" : "bottom-4"
      } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/95 p-3 pr-8 shadow-xl backdrop-blur">
        <Link href={`/products/${e.slug}`} className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface">
          {e.image && <Image src={e.image} alt="" fill className="object-cover" sizes="44px" />}
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm text-navy">
            <span className="font-semibold">{e.name}</span> ordered {e.qty}× {e.product}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Sample activity · a few minutes ago</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-1.5 top-1.5 rounded p-1 text-muted hover:text-navy"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
