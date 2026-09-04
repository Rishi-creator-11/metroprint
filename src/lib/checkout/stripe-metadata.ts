/** Stripe metadata values are limited to 500 characters per key. */
const STRIPE_METADATA_MAX = 450;

export function chunkForStripeMetadata(
  key: string,
  value: string,
  maxLen = STRIPE_METADATA_MAX
): Record<string, string> {
  const out: Record<string, string> = {};
  if (value.length <= maxLen) {
    out[key] = value;
    return out;
  }

  let part = 0;
  for (let i = 0; i < value.length; i += maxLen) {
    out[part === 0 ? key : `${key}_${part}`] = value.slice(i, i + maxLen);
    part++;
  }
  return out;
}

export function unchunkFromStripeMetadata(
  metadata: Record<string, string | null | undefined>,
  key: string
): string {
  let result = metadata[key] || "";
  let part = 1;
  while (metadata[`${key}_${part}`]) {
    result += metadata[`${key}_${part}`]!;
    part++;
  }
  return result;
}
