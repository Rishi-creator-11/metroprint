/**
 * Print specifications for the artwork studio.
 *
 * A spec resolves a finished print size to pixel/inch geometry the canvas editor
 * needs: trim box, bleed, safe margin and number of sides. Values come from
 * (1) an admin override on the product (`products.print_specs`), else
 * (2) a per-slug default here, else (3) a category default, else (4) a size
 * string parsed from the customer's selected options.
 */

export type PrintUnit = "in" | "mm";

export interface PrintSpec {
  /** Finished (trimmed) width. */
  width: number;
  /** Finished (trimmed) height. */
  height: number;
  unit: PrintUnit;
  /** Bleed added to every edge, in `unit`. */
  bleed: number;
  /** Safe margin inside the trim, in `unit`. */
  safeMargin: number;
  /** 1 = single-sided, 2 = front + back. */
  sides: 1 | 2;
  /** Human label, e.g. `3.5" × 2"`. */
  label?: string;
}

export interface ResolvedPrintSpec extends PrintSpec {
  /** Full artboard including bleed. */
  bleedWidth: number;
  bleedHeight: number;
  /** Minimum long-edge pixels for ~300 DPI at this size. */
  recommendedPx: { width: number; height: number };
}

const IN_PER_MM = 1 / 25.4;

export function toInches(value: number, unit: PrintUnit): number {
  return unit === "mm" ? value * IN_PER_MM : value;
}

/** Default bleed / safe by broad product family (inches). */
const FAMILY_DEFAULTS: Record<string, Pick<PrintSpec, "bleed" | "safeMargin" | "unit">> = {
  "business-cards": { bleed: 0.125, safeMargin: 0.125, unit: "in" },
  "print-small": { bleed: 0.125, safeMargin: 0.125, unit: "in" }, // flyers, postcards
  "print-large": { bleed: 0.125, safeMargin: 0.25, unit: "in" }, // posters
  "large-format": { bleed: 0.25, safeMargin: 0.5, unit: "in" }, // banners, signs
};

/** Per-slug fixed specs (used when the product has no size option or one fixed size). */
const SLUG_SPECS: Record<string, PrintSpec> = {
  "business-cards-standard": {
    width: 3.5, height: 2, unit: "in", bleed: 0.125, safeMargin: 0.125, sides: 2, label: '3.5" × 2"',
  },
};

/** Which products open the design studio (vs. the simple file upload). */
export const STUDIO_SLUGS = new Set<string>([
  "business-cards-standard",
  "flyers",
  "postcards",
  "posters",
  "large-format-posters",
  "roll-up-banners",
  "banners",
  "coroplast-signs",
]);

export function isStudioProduct(slug: string): boolean {
  return STUDIO_SLUGS.has(slug);
}

function familyForSlug(slug: string, category: string): keyof typeof FAMILY_DEFAULTS {
  if (slug.startsWith("business-cards")) return "business-cards";
  if (category === "Large Format") return "large-format";
  if (slug.includes("poster")) return "print-large";
  return "print-small";
}

/**
 * Parse a size option string into inches.
 * Handles: `3.5" x 2"`, `4" x 6"`, `11" x 17"`, `2' x 4'`, `24 x 36 in`, `850 x 540 mm`.
 */
export function parseSizeString(raw: string): { width: number; height: number; unit: PrintUnit } | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase().replace(/×/g, "x");
  const mm = /mm/.test(s);
  const feet = /['’]/.test(s) || /\bft\b/.test(s);
  const m = s.match(/([\d.]+)\s*(?:["”'’]|in|mm|ft)?\s*x\s*([\d.]+)/);
  if (!m) return null;
  let w = parseFloat(m[1]);
  let h = parseFloat(m[2]);
  if (!isFinite(w) || !isFinite(h)) return null;
  if (feet) {
    w *= 12;
    h *= 12;
  }
  return { width: w, height: h, unit: mm ? "mm" : "in" };
}

function finalize(spec: PrintSpec): ResolvedPrintSpec {
  const wIn = toInches(spec.width, spec.unit);
  const hIn = toInches(spec.height, spec.unit);
  const bleedIn = toInches(spec.bleed, spec.unit);
  return {
    ...spec,
    bleedWidth: spec.width + spec.bleed * 2,
    bleedHeight: spec.height + spec.bleed * 2,
    recommendedPx: {
      width: Math.round((wIn + bleedIn * 2) * 300),
      height: Math.round((hIn + bleedIn * 2) * 300),
    },
  };
}

export interface PrintSpecInput {
  slug: string;
  category: string;
  /** Raw `products.print_specs` jsonb (admin override), if any. */
  override?: unknown;
  /** The customer's selected size option value, if the product has one. */
  selectedSize?: string;
  /** Whether the product's options include front/back sides. */
  sidesHint?: 1 | 2;
}

function readOverride(override: unknown, selectedSize?: string): PrintSpec | null {
  if (!override || typeof override !== "object") return null;
  const o = override as Record<string, unknown>;
  // Shape A: { default: {...}, bySize: { '4" x 6"': {...} } }
  const bySize = (o.bySize ?? o.by_size) as Record<string, unknown> | undefined;
  const pick =
    (selectedSize && bySize && typeof bySize === "object" ? bySize[selectedSize] : undefined) ??
    o.default ??
    (typeof o.width === "number" ? o : undefined);
  if (!pick || typeof pick !== "object") return null;
  const p = pick as Record<string, unknown>;
  if (typeof p.width !== "number" || typeof p.height !== "number") return null;
  return {
    width: p.width,
    height: p.height,
    unit: p.unit === "mm" ? "mm" : "in",
    bleed: typeof p.bleed === "number" ? p.bleed : 0.125,
    safeMargin:
      typeof p.safeMargin === "number"
        ? p.safeMargin
        : typeof p.safe_margin === "number"
          ? p.safe_margin
          : 0.125,
    sides: p.sides === 2 ? 2 : 1,
    label: typeof p.label === "string" ? p.label : undefined,
  };
}

export function resolvePrintSpec(input: PrintSpecInput): ResolvedPrintSpec {
  const { slug, category, override, selectedSize, sidesHint } = input;

  const fromOverride = readOverride(override, selectedSize);
  if (fromOverride) return finalize(fromOverride);

  if (SLUG_SPECS[slug]) {
    const base = SLUG_SPECS[slug];
    return finalize(sidesHint ? { ...base, sides: sidesHint } : base);
  }

  const fam = FAMILY_DEFAULTS[familyForSlug(slug, category)];
  const parsed = selectedSize ? parseSizeString(selectedSize) : null;

  if (parsed) {
    return finalize({
      width: parsed.width,
      height: parsed.height,
      unit: parsed.unit,
      bleed: fam.bleed,
      safeMargin: fam.safeMargin,
      sides: sidesHint ?? 1,
      label: selectedSize,
    });
  }

  // Last-resort fallback so the studio always renders something sane.
  const fallback: Record<string, PrintSpec> = {
    "large-format": { width: 24, height: 36, unit: "in", bleed: 0.25, safeMargin: 0.5, sides: 1, label: '24" × 36"' },
    "print-large": { width: 18, height: 24, unit: "in", bleed: 0.125, safeMargin: 0.25, sides: 1, label: '18" × 24"' },
    "print-small": { width: 8.5, height: 11, unit: "in", bleed: 0.125, safeMargin: 0.125, sides: 2, label: '8.5" × 11"' },
    "business-cards": { width: 3.5, height: 2, unit: "in", bleed: 0.125, safeMargin: 0.125, sides: 2, label: '3.5" × 2"' },
  };
  return finalize(fallback[familyForSlug(slug, category)]);
}
