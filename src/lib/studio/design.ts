import type { ResolvedPrintSpec } from "@/lib/studio/print-specs";

export type SideKey = "front" | "back";

export interface ArtworkLayer {
  kind: "image";
  /** Supabase Storage public URL. */
  url: string;
  name: string;
  /** Natural pixel dimensions of the uploaded file. */
  naturalWidth: number;
  naturalHeight: number;
  /** Placement in artboard inches (top-left origin, includes bleed area). */
  x: number;
  y: number;
  /** Rendered size in inches. */
  width: number;
  height: number;
  rotation: number;
}

export interface TextLayer {
  kind: "text";
  text: string;
  /** Placement in artboard inches. */
  x: number;
  y: number;
  /** Font size in points. */
  fontSize: number;
  fill: string;
  bold: boolean;
  align: "left" | "center" | "right";
  width: number;
  rotation: number;
}

export type Layer = ArtworkLayer | TextLayer;

export interface SideDesign {
  background: string; // "#ffffff" | "transparent" | hex
  layers: Layer[];
}

export interface StudioDesign {
  productSlug: string;
  spec: ResolvedPrintSpec;
  selectedOptions: Record<string, string>;
  front: SideDesign;
  back: SideDesign | null;
  /** Populated when the customer approves. */
  approvedAt?: string;
  /** Warnings the customer acknowledged. */
  acknowledgedWarnings?: string[];
  updatedAt: string;
}

export function emptySide(background = "#ffffff"): SideDesign {
  return { background, layers: [] };
}

export function newDesign(
  productSlug: string,
  spec: ResolvedPrintSpec,
  selectedOptions: Record<string, string>,
): StudioDesign {
  return {
    productSlug,
    spec,
    selectedOptions,
    front: emptySide(),
    back: spec.sides === 2 ? emptySide() : null,
    updatedAt: new Date().toISOString(),
  };
}

export type DpiRating = "good" | "warn" | "bad";

export function ratingForDpi(dpi: number): DpiRating {
  if (dpi >= 300) return "good";
  if (dpi >= 150) return "warn";
  return "bad";
}

/** Effective DPI of an image layer = natural px / printed inches. */
export function layerDpi(layer: ArtworkLayer): number {
  const longNatural = Math.max(layer.naturalWidth, layer.naturalHeight);
  const longInches = Math.max(layer.width, layer.height);
  if (longInches <= 0) return 0;
  return Math.round(longNatural / longInches);
}

export interface DesignWarning {
  id: string;
  side: SideKey;
  level: "warn" | "error";
  message: string;
}

/**
 * Static pre-flight checks. Geometry is in artboard inches where (0,0) is the
 * top-left of the bleed box and the trim box is inset by `spec.bleed`.
 */
export function preflight(design: StudioDesign): DesignWarning[] {
  const out: DesignWarning[] = [];
  const { spec } = design;
  const sides: [SideKey, SideDesign | null][] = [
    ["front", design.front],
    ["back", design.back],
  ];

  for (const [side, sd] of sides) {
    if (!sd) continue;
    const images = sd.layers.filter((l): l is ArtworkLayer => l.kind === "image");
    const hasContent = sd.layers.length > 0 || sd.background === "transparent";

    if (side === "back" && spec.sides === 2 && !hasContent && sd.background === "#ffffff") {
      out.push({ id: `${side}-empty`, side, level: "warn", message: "Back side is blank — it will print white." });
    }
    if (side === "front" && images.length === 0 && sd.layers.length === 0) {
      out.push({ id: `${side}-empty`, side, level: "error", message: "Front has no artwork yet." });
    }

    for (const img of images) {
      const dpi = layerDpi(img);
      if (dpi > 0 && dpi < 150) {
        out.push({
          id: `${side}-lowdpi-${img.url}`,
          side,
          level: "warn",
          message: `Low resolution (~${dpi} DPI) — “${img.name}” may print blurry. 300 DPI recommended.`,
        });
      } else if (dpi >= 150 && dpi < 300) {
        out.push({
          id: `${side}-okdpi-${img.url}`,
          side,
          level: "warn",
          message: `Borderline resolution (~${dpi} DPI) for “${img.name}”. 300 DPI recommended for crisp print.`,
        });
      }

      // Background image should cover the full bleed box.
      const coversBleed =
        img.x <= 0.01 &&
        img.y <= 0.01 &&
        img.x + img.width >= spec.bleedWidth - 0.01 &&
        img.y + img.height >= spec.bleedHeight - 0.01;
      const nearFull = img.width >= spec.width * 0.6 && img.height >= spec.height * 0.6;
      if (nearFull && !coversBleed) {
        out.push({
          id: `${side}-bleed-${img.url}`,
          side,
          level: "warn",
          message: "Artwork doesn't reach the bleed — you may get white edges after trimming.",
        });
      }

      // Content pushed outside the safe area.
      const safe = spec.bleed + spec.safeMargin;
      const outsideSafe =
        img.x < safe - 0.02 ||
        img.y < safe - 0.02 ||
        img.x + img.width > spec.bleedWidth - safe + 0.02 ||
        img.y + img.height > spec.bleedHeight - safe + 0.02;
      if (!nearFull && outsideSafe) {
        out.push({
          id: `${side}-safe-${img.url}`,
          side,
          level: "warn",
          message: "Some artwork is outside the safe area and could be trimmed off.",
        });
      }
    }
  }

  return out;
}

/** Compact shape stored on the cart item / order. */
export interface CartDesignRef {
  productSlug: string;
  frontUrl: string | null;
  backUrl: string | null;
  thumbnailUrl: string | null;
  sides: 1 | 2;
  specLabel?: string;
}

export function toCartRef(design: StudioDesign, thumbnailUrl: string | null): CartDesignRef {
  const firstImage = (sd: SideDesign | null) =>
    (sd?.layers.find((l) => l.kind === "image") as ArtworkLayer | undefined)?.url ?? null;
  return {
    productSlug: design.productSlug,
    frontUrl: firstImage(design.front),
    backUrl: firstImage(design.back),
    thumbnailUrl,
    sides: design.spec.sides,
    specLabel: design.spec.label,
  };
}
