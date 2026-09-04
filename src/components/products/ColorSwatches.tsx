"use client";

import { Check } from "lucide-react";
import { colorHex, isLightColor } from "@/lib/products/apparel";

export function ColorSwatches({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} aria-required={required}>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => {
          const selected = value === opt;
          const hex = colorHex(opt);
          const border = isLightColor(opt) ? "rgba(15,23,42,0.18)" : "transparent";
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={opt}
              title={opt}
              onClick={() => onChange(opt)}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                selected ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              style={{ backgroundColor: hex, boxShadow: `inset 0 0 0 1px ${border}` }}
            >
              {selected && (
                <Check
                  size={16}
                  strokeWidth={3}
                  className="absolute inset-0 m-auto"
                  color={isLightColor(opt) ? "#0f172a" : "#ffffff"}
                />
              )}
            </button>
          );
        })}
      </div>
      {value && (
        <p className="mt-2 text-sm text-navy">
          <span className="text-muted">Colour:</span>{" "}
          <span className="font-semibold">{value}</span>
        </p>
      )}
    </div>
  );
}
