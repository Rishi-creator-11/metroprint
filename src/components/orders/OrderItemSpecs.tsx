import { formatPrice } from "@/lib/products/product-prices";
import { ExternalLink } from "lucide-react";
import type { CartItem } from "@/lib/types";

function isPreviewableImage(url: string, name?: string): boolean {
  const source = (name || url).toLowerCase();
  return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(source);
}

function formatOptionLabel(key: string): string {
  return key.replace(/_/g, " ");
}

export function ArtworkFilesList({
  files,
  showPreview = false,
}: {
  files: { name: string; url: string }[];
  showPreview?: boolean;
}) {
  if (!files.length) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Artwork</p>
      <ul className="mt-2 space-y-2">
        {files.map((file) => (
          <li key={file.url}>
            {showPreview && isPreviewableImage(file.url, file.name) ? (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-h-40 w-full object-contain bg-surface p-2"
                />
                <span className="block border-t border-border bg-white px-3 py-2 text-xs text-primary hover:underline">
                  {file.name}
                </span>
              </a>
            ) : (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink size={12} /> {file.name}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OrderItemSpecs({
  item,
  showArtworkPreview = false,
}: {
  item: CartItem;
  showArtworkPreview?: boolean;
}) {
  return (
    <div>
      <p className="font-medium text-navy">{item.product_title}</p>
      <p className="text-xs text-muted">{item.category}</p>

      {Object.keys(item.selected_options || {}).length > 0 && (
        <dl className="mt-3 space-y-1.5 rounded-lg bg-surface px-3 py-2">
          {Object.entries(item.selected_options).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 text-sm">
              <dt className="capitalize text-muted">{formatOptionLabel(key)}</dt>
              <dd className="text-right font-medium text-navy">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="mt-3 text-sm text-muted">
        {item.is_tier_pricing ? (
          <span className="font-semibold text-navy">
            {formatPrice(item.line_total || item.unit_price)}
          </span>
        ) : (
          <>
            {formatPrice(item.unit_price)} × {item.quantity}
            <span className="ml-2 font-semibold text-navy">
              = {formatPrice(item.line_total || item.unit_price * item.quantity)}
            </span>
          </>
        )}
      </p>

      {item.artwork_files && item.artwork_files.length > 0 && (
        <ArtworkFilesList files={item.artwork_files} showPreview={showArtworkPreview} />
      )}

      {item.design && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Studio design{item.design.specLabel ? ` · ${item.design.specLabel}` : ""}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {([
              ["Front", item.design.frontUrl],
              ...(item.design.sides === 2 ? [["Back", item.design.backUrl] as const] : []),
            ] as const).map(([label, url]) => (
              <div key={label} className="rounded-lg border border-border">
                <p className="border-b border-border bg-surface px-2 py-1 text-[11px] font-semibold text-navy">{label}</p>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`${label} artwork`} className="max-h-40 w-full bg-surface object-contain p-2" />
                    <span className="flex items-center gap-1 border-t border-border px-2 py-1.5 text-xs text-primary hover:underline">
                      <ExternalLink size={11} /> Open original
                    </span>
                  </a>
                ) : (
                  <p className="px-2 py-3 text-xs text-muted">No artwork</p>
                )}
              </div>
            ))}
          </div>
          {item.design_full && (
            <details className="mt-2 rounded-lg border border-border bg-surface/50 px-3 py-2">
              <summary className="cursor-pointer text-xs font-medium text-navy">Placement &amp; print specs</summary>
              <pre className="mt-2 overflow-x-auto text-[10px] leading-relaxed text-muted">
                {JSON.stringify(
                  {
                    spec: item.design_full.spec,
                    front: item.design_full.front.layers.map((l) =>
                      l.kind === "image"
                        ? { image: l.name, x: +l.x.toFixed(2), y: +l.y.toFixed(2), w: +l.width.toFixed(2), h: +l.height.toFixed(2), rot: l.rotation }
                        : { text: l.text, x: +l.x.toFixed(2), y: +l.y.toFixed(2) },
                    ),
                    back: item.design_full.back?.layers.map((l) =>
                      l.kind === "image"
                        ? { image: l.name, x: +l.x.toFixed(2), y: +l.y.toFixed(2), w: +l.width.toFixed(2), h: +l.height.toFixed(2), rot: l.rotation }
                        : { text: l.text, x: +l.x.toFixed(2), y: +l.y.toFixed(2) },
                    ),
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
