import { formatPrice } from "@/lib/product-prices";
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
        {formatPrice(item.unit_price)} × {item.quantity}
        <span className="ml-2 font-semibold text-navy">
          = {formatPrice(item.line_total || item.unit_price * item.quantity)}
        </span>
      </p>

      {item.artwork_files && item.artwork_files.length > 0 && (
        <ArtworkFilesList files={item.artwork_files} showPreview={showArtworkPreview} />
      )}
    </div>
  );
}
