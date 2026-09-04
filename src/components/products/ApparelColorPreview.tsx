"use client";

import { useId } from "react";
import { colorHex, isLightColor, type GarmentShape } from "@/lib/products/apparel";

/**
 * Live apparel colour preview — an SVG garment silhouette filled with the
 * selected colour, with soft shading for depth. Smooth colour transition.
 * Architecture note: when real per-colour photos exist, `ProductConfigurator`
 * shows `product.variant_images[color]` instead and this is the fallback.
 */
export function ApparelColorPreview({
  shape,
  color,
  title,
}: {
  shape: GarmentShape;
  color?: string;
  title: string;
}) {
  const uid = useId().replace(/:/g, "");
  const fill = color ? colorHex(color) : "#e2e8f0";
  const light = color ? isLightColor(color) : true;
  const shade = light ? "rgba(15,23,42,0.10)" : "rgba(0,0,0,0.28)";
  const hi = light ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.14)";

  return (
    <svg
      viewBox="0 0 300 300"
      className="h-full w-full"
      role="img"
      aria-label={color ? `${title} preview in ${color}` : `${title} preview`}
    >
      <defs>
        <radialGradient id={`hi-${uid}`} cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor={hi} />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id={`sh-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor={shade} />
        </linearGradient>
      </defs>

      <g className="garment-tint" style={{ transition: "fill 0.35s ease" }}>
        <GarmentPath shape={shape} fill={fill} />
      </g>
      {/* depth overlays reuse the same paths */}
      <g style={{ mixBlendMode: "multiply" }} opacity={0.9}>
        <GarmentPath shape={shape} fill={`url(#sh-${uid})`} />
      </g>
      <g style={{ mixBlendMode: "screen" }}>
        <GarmentPath shape={shape} fill={`url(#hi-${uid})`} />
      </g>
      <g fill="none" stroke={shade} strokeWidth={2}>
        <GarmentDetail shape={shape} />
      </g>
    </svg>
  );
}

function GarmentPath({ shape, fill }: { shape: GarmentShape; fill: string }) {
  switch (shape) {
    case "hat":
      return (
        <path
          fill={fill}
          d="M60 150c0-46 40-78 90-78s90 32 90 78c0 8-6 14-14 14H74c-8 0-14-6-14-14zM52 168h150c26 0 44 8 44 20 0 8-10 14-24 14H62c-14 0-24-6-24-14 0-9 6-16 14-20z"
        />
      );
    case "tote":
      return (
        <path
          fill={fill}
          d="M78 96h144c8 0 14 6 15 14l14 150c1 10-7 18-17 18H72c-10 0-18-8-17-18l14-150c1-8 7-14 15-14z"
        />
      );
    case "hoodie":
      return (
        <path
          fill={fill}
          d="M150 40c-24 0-44 14-52 34l-46 20c-10 4-14 16-10 26l16 40c3 8 12 12 20 9l14-5v96c0 9 7 16 16 16h84c9 0 16-7 16-16v-96l14 5c8 3 17-1 20-9l16-40c4-10 0-22-10-26l-46-20c-8-20-28-34-52-34z"
        />
      );
    case "longsleeve":
      return (
        <path
          fill={fill}
          d="M150 46c-16 0-30 6-40 16l-52 18c-9 3-14 12-13 21l12 120c1 8 7 14 15 14l14-1 3 44c0 9 7 15 16 15h96c9 0 16-6 16-15l3-44 14 1c8 0 14-6 15-14l12-120c1-9-4-18-13-21l-52-18c-10-10-24-16-40-16z"
        />
      );
    case "shirt":
    default:
      return (
        <path
          fill={fill}
          d="M150 48c-16 0-30 6-40 16l-58 24c-9 4-13 14-9 23l18 40c3 8 12 11 20 8l16-6v106c0 9 7 16 16 16h74c9 0 16-7 16-16V153l16 6c8 3 17 0 20-8l18-40c4-9 0-19-9-23l-58-24c-10-10-24-16-40-16z"
        />
      );
  }
}

function GarmentDetail({ shape }: { shape: GarmentShape }) {
  switch (shape) {
    case "hat":
      return <path d="M150 96c-18 10-26 30-26 54M150 96c18 10 26 30 26 54" />;
    case "tote":
      return <path d="M108 96c0-26 12-42 42-42s42 16 42 42" />;
    case "hoodie":
      return (
        <>
          <path d="M112 74c14 18 62 18 76 0" />
          <path d="M124 190h52M150 150v56" />
          <path d="M138 96l-4 40M162 96l4 40" />
        </>
      );
    case "longsleeve":
    case "shirt":
    default:
      return <path d="M120 66c8 12 52 12 60 0" />;
  }
}
