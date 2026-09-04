/**
 * Pricing regression tests — Phase 3.
 *
 * These FREEZE the current behaviour of `calculateLinePrice()` (the single
 * pricing function used for both the live storefront preview and the
 * authoritative server-side checkout recompute). They are not aspirational:
 * every expected number is what the code + the 2026-09-03 Supabase snapshot
 * (see fixtures.ts) produce today. If a refactor changes a number here, that is
 * a regression to investigate — not a test to "fix".
 *
 * Nothing in this phase changes pricing behaviour, live data, or product config.
 */
import { describe, it, expect } from "vitest";
import {
  calculateLinePrice,
  normalizePricingRules,
  type LinePriceResult,
} from "@/lib/pricing/pricing";
import { getProductPrice } from "@/lib/products/product-prices";
import { calcLine, calcLineRaw, seedSchema } from "./fixtures";

const QUOTE_REQUIRED: LinePriceResult = {
  lineTotal: 0,
  unitPrice: 0,
  orderQuantity: 0,
  isTierPricing: true,
  requiresQuote: true,
};

// ---------------------------------------------------------------------------
// Business Cards — Standard
// ---------------------------------------------------------------------------
describe("Standard Business Cards (business-cards-standard)", () => {
  it("quantity tier + stock + finish + corners + sides add-ons stack exactly", () => {
    // 29.99 (qty 500 tier) + 5 (16pt) + 8 (UV Gloss) + 3 (Rounded) + 5 (Double) = 50.99
    expect(
      calcLine("business-cards-standard", {
        quantity: "500",
        stock: "16pt",
        finish: "UV Gloss",
        corners: "Rounded",
        sides: "Double Sided",
      }),
    ).toEqual({
      lineTotal: 50.99,
      unitPrice: 50.99,
      orderQuantity: 500,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("individual add-ons on the 29.99 (qty 500) tier: 16pt=+5, UV Gloss=+8, Rounded=+3, Double Sided=+5", () => {
    expect(calcLine("business-cards-standard", { quantity: "500", stock: "16pt" }).lineTotal).toBe(34.99);
    expect(calcLine("business-cards-standard", { quantity: "500", stock: "18pt" }).lineTotal).toBe(39.99);
    expect(calcLine("business-cards-standard", { quantity: "500", finish: "UV Gloss" }).lineTotal).toBe(37.99);
    expect(calcLine("business-cards-standard", { quantity: "500", corners: "Rounded" }).lineTotal).toBe(32.99);
    expect(calcLine("business-cards-standard", { quantity: "500", sides: "Double Sided" }).lineTotal).toBe(34.99);
  });

  it("quantity tier IS the whole order price (not tier x quantity)", () => {
    const r = calcLine("business-cards-standard", { quantity: "1,000" });
    expect(r.lineTotal).toBe(40.49);
    expect(r.orderQuantity).toBe(1000);
    expect(r.lineTotal).not.toBe(40.49 * r.orderQuantity);
    expect(r.lineTotal).not.toBe(29.99 * r.orderQuantity);
    expect(r.isTierPricing).toBe(true);
  });

  it("every quantity tier value is frozen", () => {
    const q = (v: string) => calcLine("business-cards-standard", { quantity: v }).lineTotal;
    expect(q("250")).toBe(25.49);
    expect(q("500")).toBe(29.99);
    expect(q("1,000")).toBe(40.49);
    expect(q("2,500")).toBe(59.98);
    expect(q("5,000")).toBe(83.97);
    expect(q("10,000")).toBe(119.96);
  });

  it("options explicitly priced 0 do not fall through to another price source", () => {
    // 14pt/Matte/Rectangle/Single Sided are all 0 in pricing_rules
    expect(
      calcLine("business-cards-standard", {
        quantity: "500",
        stock: "14pt",
        finish: "Matte",
        corners: "Rectangle",
        sides: "Single Sided",
      }).lineTotal,
    ).toBe(29.99);
  });

  it("unpriced option (need_design_help) never changes the price", () => {
    expect(calcLine("business-cards-standard", { quantity: "500", need_design_help: "Yes" }).lineTotal).toBe(29.99);
    expect(calcLine("business-cards-standard", { quantity: "500", need_design_help: "No" }).lineTotal).toBe(29.99);
  });

  it('"Custom order" quantity → quote-required result shape', () => {
    expect(
      calcLine("business-cards-standard", { quantity: "Custom order", stock: "18pt", finish: "UV Gloss" }),
    ).toEqual(QUOTE_REQUIRED);
  });

  it("no quantity selected → lowest tier is the starting price, add-ons still apply", () => {
    expect(calcLine("business-cards-standard", { stock: "16pt" })).toEqual({
      lineTotal: 30.49, // 25.49 (lowest tier) + 5
      unitPrice: 30.49,
      orderQuantity: 1,
      isTierPricing: true,
      requiresQuote: false,
    });
  });
});

// ---------------------------------------------------------------------------
// Business Cards — Premium
// ---------------------------------------------------------------------------
describe("Premium Business Cards", () => {
  it("Metallic Foil: qty tier + double-sided foil + lamination + sides", () => {
    // 36.55 (qty 250) + 8 (foil both sides) + 5 (Matte Lamination) + 6 (Double Sided) = 55.55
    expect(
      calcLine("business-cards-premium-metallic-foil-raised", {
        quantity: "250",
        size: '3.5" x 2"',
        foil_color: "Gold metallic foil (both sides)",
        lamination: "Matte Lamination 2 Sided",
        corners: "Rectangle",
        sides: "Double Sided",
      }),
    ).toEqual({
      lineTotal: 55.55,
      unitPrice: 55.55,
      orderQuantity: 250,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Metallic Foil: front-only foil colours are a real 0 add-on", () => {
    expect(
      calcLine("business-cards-premium-metallic-foil-raised", {
        quantity: "500",
        foil_color: "Gold metallic foil (front)",
      }).lineTotal,
    ).toBe(43); // qty 500 tier, no add-on
    expect(
      calcLine("business-cards-premium-metallic-foil-raised", {
        quantity: "500",
        lamination: "Soft Touch Lamination 2 Sided",
      }).lineTotal,
    ).toBe(51); // 43 + 8
  });

  it("Spot UV: qty tier + both-sides spot UV + lamination + corners + sides", () => {
    // 43.93 (qty 500) + 10 (Both sides) + 8 (Soft Touch Lam) + 3 (Rounded) + 6 (Double) = 70.93
    expect(
      calcLine("business-cards-premium-spot-uv-raised", {
        quantity: "500",
        spot_uv: "Both sides",
        lamination: "Soft Touch Lamination 2 Sided",
        corners: "Rounded",
        sides: "Double Sided",
      }),
    ).toEqual({
      lineTotal: 70.93,
      unitPrice: 70.93,
      orderQuantity: 500,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it('Spot UV: "One sided" spot UV is a 0 add-on', () => {
    expect(
      calcLine("business-cards-premium-spot-uv-raised", { quantity: "250", spot_uv: "One sided" }).lineTotal,
    ).toBe(37.34);
  });

  it("32pt Painted Edge: metallic edge colour + double sided", () => {
    // 61.57 (qty 250) + 5 (Metallic Gold) + 8 (Double Sided) = 74.57
    expect(
      calcLine("business-cards-premium-32pt-painted-edge", {
        quantity: "250",
        size: '3.5" x 2"',
        paint_color: "Metallic Gold",
        sides: "Double Sided",
      }),
    ).toEqual({
      lineTotal: 74.57,
      unitPrice: 74.57,
      orderQuantity: 250,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("32pt Painted Edge: non-metallic edge colours are 0, metallic tiers are +3 / +5 (partial pricing within a field)", () => {
    const q = (color: string) =>
      calcLine("business-cards-premium-32pt-painted-edge", { quantity: "250", paint_color: color }).lineTotal;
    expect(q("Black")).toBe(61.57); // plain colour, +0
    expect(q("White (Not Painted)")).toBe(61.57); // +0
    expect(q("Metallic Blue")).toBe(64.57); // 61.57 + 3
    expect(q("Metallic Gold")).toBe(66.57); // 61.57 + 5
  });
});

// ---------------------------------------------------------------------------
// Business Cards — Custom / Specialty
// ---------------------------------------------------------------------------
describe("Custom / Specialty Business Cards", () => {
  it("Plastic: qty tier beats base price; size + shape + plastic_type + colorspec add-ons", () => {
    // base price is 19.57 but selecting qty 250 uses the 29.74 tier
    // 29.74 + 2 (size) + 10 (Rounded 4 Corners) + 5 (Clear Plastic) + 10 (4/4) = 56.74
    const r = calcLine("business-cards-specialty-plastic", {
      quantity: "250",
      size: '2" x 3.5"',
      shape: "Rounded 4 Corners",
      plastic_type: "Clear Plastic",
      colorspec: "4/4 (4 color both sides)",
    });
    expect(r).toEqual({
      lineTotal: 56.74,
      unitPrice: 56.74,
      orderQuantity: 250,
      isTierPricing: true,
      requiresQuote: false,
    });
    // proves the line was built off the 29.74 tier, not the 19.57 base price
    expect(getProductPrice("business-cards-specialty-plastic", 19.57)).toBe(19.57);
    expect(r.lineTotal).toBeGreaterThan(29.74);
  });

  it("Plastic: individual specialty add-ons are frozen (on the 29.74 qty-250 tier)", () => {
    const s = (opts: Record<string, string>) =>
      calcLine("business-cards-specialty-plastic", { quantity: "250", ...opts }).lineTotal;
    expect(s({ size: '2" x 3.5"' })).toBe(31.74); // +2
    expect(s({ shape: "Oval" })).toBe(34.74); // +5
    expect(s({ shape: "Rounded 4 Corners" })).toBe(39.74); // +10
    expect(s({ plastic_type: "White Plastic" })).toBe(31.74); // +2
    expect(s({ plastic_type: "Frosted Plastic" })).toBe(33.74); // +4
    expect(s({ colorspec: "4/0 (4 color front)" })).toBe(31.74); // +2
  });

  it("Magnetic: qty tier + shape + corner_radius", () => {
    // 39.99 (qty 500) + 5 (Oval) + 3 (1/4" radius) = 47.99
    expect(
      calcLine("business-cards-specialty-magnetic", {
        quantity: "500",
        shape: "Oval",
        corner_radius: '1/4"',
      }),
    ).toEqual({
      lineTotal: 47.99,
      unitPrice: 47.99,
      orderQuantity: 500,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Magnetic: 3/16\" radius = +2, Rectangle shape = +0", () => {
    expect(
      calcLine("business-cards-specialty-magnetic", {
        quantity: "250",
        shape: "Rectangle",
        corner_radius: '3/16"',
      }).lineTotal,
    ).toBe(35.99); // 33.99 + 2
  });

  it("Fold-over: qty tier + size + finish", () => {
    // 31.44 (qty 250) + 5 (3.5" x 4") + 12 (Soft Touch) = 48.44
    expect(
      calcLine("business-cards-specialty-fold-over", {
        quantity: "250",
        size: '3.5" x 4"',
        finish: "Soft Touch",
      }),
    ).toEqual({
      lineTotal: 48.44,
      unitPrice: 48.44,
      orderQuantity: 250,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Fold-over: 2\" x 7\" size and Matte finish are 0 add-ons", () => {
    expect(
      calcLine("business-cards-specialty-fold-over", { quantity: "500", size: '2" x 7"', finish: "Matte" }).lineTotal,
    ).toBe(36.99);
  });
});

// ---------------------------------------------------------------------------
// Print Materials
// ---------------------------------------------------------------------------
describe("Print Materials", () => {
  it("Postcards: qty tier + Double Sided + 16pt C2S", () => {
    expect(calcLine("postcards", { quantity: "500", sides: "Double Sided", stock: "16pt C2S" })).toEqual({
      lineTotal: 47.99, // 39.99 + 5 + 3
      unitPrice: 47.99,
      orderQuantity: 500,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Postcards: Custom order → quote required", () => {
    expect(calcLine("postcards", { quantity: "Custom order" })).toEqual(QUOTE_REQUIRED);
  });

  it("Brochures: qty tier + Double Sided (fold_type is a 0 add-on)", () => {
    expect(calcLine("brochures", { quantity: "250", sides: "Double Sided", fold_type: "Z Fold" })).toEqual({
      lineTotal: 94.99, // 89.99 + 5
      unitPrice: 94.99,
      orderQuantity: 250,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Bookmarks: qty tier + 16pt C2S + Double Sided", () => {
    expect(calcLine("bookmarks", { quantity: "1,000", stock: "16pt C2S", sides: "Double Sided" })).toEqual({
      lineTotal: 61.99, // 53.99 + 3 + 5
      unitPrice: 61.99,
      orderQuantity: 1000,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Door Hangers: qty tier + Double Sided; 16pt C2S add-on", () => {
    expect(calcLine("door-hangers", { quantity: "500", sides: "Double Sided" })).toEqual({
      lineTotal: 64.99, // 59.99 + 5
      unitPrice: 64.99,
      orderQuantity: 500,
      isTierPricing: true,
      requiresQuote: false,
    });
    expect(calcLine("door-hangers", { quantity: "250", stock: "16pt C2S" }).lineTotal).toBe(53.99); // 50.99 + 3
  });

  it("Folders: qty tier, all option add-ons currently 0", () => {
    expect(
      calcLine("folders", { quantity: "250", pockets: "Yes", business_card_slit: "Both Sides" }),
    ).toEqual({
      lineTotal: 99.99,
      unitPrice: 99.99,
      orderQuantity: 250,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Posters: qty 250 tier ($15) is BELOW the base price ($19.99) — frozen as-is", () => {
    const r = calcLine("posters", { quantity: "250", size: '18" x 24"', paper_type: "Glossy" });
    expect(r).toEqual({
      lineTotal: 15,
      unitPrice: 15,
      orderQuantity: 250,
      isTierPricing: true,
      requiresQuote: false,
    });
    expect(getProductPrice("posters", 19.99)).toBe(19.99);
    expect(r.lineTotal).toBeLessThan(19.99); // review item — see PRICING_ARCHITECTURE.md
  });

  it("Roll-Up Banners: qty tier; banner_type currently adds $0 (schema/DB drift)", () => {
    // Seed schema uses `banner_type` (Large Format rework) but live pricing_rules
    // still carry the old `metal_stand` map (migration 035 not applied), so every
    // banner_type option resolves to +0. Frozen — see PRICING_ARCHITECTURE.md.
    expect(
      calcLine("roll-up-banners", {
        quantity: "500",
        banner_type: "Premium Stand 13oz Matte Vinyl",
        size: '33" x 81"',
      }),
    ).toEqual({
      lineTotal: 104.71,
      unitPrice: 104.71,
      orderQuantity: 500,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Roll-Up Banners: no quantity → lowest tier ($89)", () => {
    expect(
      calcLine("roll-up-banners", { banner_type: "13oz Matte Vinyl - Silver Base" }),
    ).toEqual({
      lineTotal: 89,
      unitPrice: 89,
      orderQuantity: 1,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it('Car Door Magnets: qty tier + real size add-on (12" x 24" = +$20), rounded_corners = +0', () => {
    expect(
      calcLine("car-door-magnets", { quantity: "500", size: '12" x 24"', rounded_corners: "Yes" }),
    ).toEqual({
      lineTotal: 78.81, // 58.81 + 20
      unitPrice: 78.81,
      orderQuantity: 500,
      isTierPricing: true,
      requiresQuote: false,
    });
    expect(calcLine("car-door-magnets", { quantity: "250", size: '18" x 24"' }).lineTotal).toBe(49.99);
  });
});

// ---------------------------------------------------------------------------
// Flyers — synthesized pricing (pricing_rules is `{}` in the DB)
// ---------------------------------------------------------------------------
describe("Flyers — SYNTHESIZED pricing (DB pricing_rules is empty)", () => {
  it("quantity tiers are generated from price x TIER_SCALE (anchor 500)", () => {
    const q = (v: string) => calcLine("flyers", { quantity: v }).lineTotal;
    expect(q("250")).toBe(42.49); // 49.99 * 0.85
    expect(q("500")).toBe(49.99); // 49.99 * 1
    expect(q("1,000")).toBe(67.49); // 49.99 * 1.35
    expect(q("2,500")).toBe(99.98); // 49.99 * 2
    expect(q("5,000")).toBe(139.97); // 49.99 * 2.8
    expect(q("10,000")).toBe(199.96); // 49.99 * 4
  });

  it("selecting a quantity yields the synthesized tier as the full line total", () => {
    expect(
      calcLine("flyers", {
        quantity: "1,000",
        size: '8.5" x 11"',
        paper_type: "100lb Gloss",
        sides: "Double Sided",
      }),
    ).toEqual({
      lineTotal: 67.49,
      unitPrice: 67.49,
      orderQuantity: 1000,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("no quantity → lowest synthesized tier ($42.49) is the starting price", () => {
    expect(calcLine("flyers", { size: '4" x 6"' })).toEqual({
      lineTotal: 42.49,
      unitPrice: 42.49,
      orderQuantity: 1,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("size / paper_type / sides currently add $0 (no add-on rules in DB)", () => {
    expect(calcLine("flyers", { quantity: "500", paper_type: "80lb Text" }).lineTotal).toBe(49.99);
    expect(calcLine("flyers", { quantity: "500", sides: "Double Sided" }).lineTotal).toBe(49.99);
  });

  it("Custom order still forces quote-required even with synthesized pricing", () => {
    expect(calcLine("flyers", { quantity: "Custom order" })).toEqual(QUOTE_REQUIRED);
  });
});

// ---------------------------------------------------------------------------
// Apparel
// ---------------------------------------------------------------------------
describe("Apparel", () => {
  it("Custom T-Shirt: quantity tier is the TOTAL for N shirts (not tier x N)", () => {
    const r = calcLine("custom-t-shirt-printing", {
      quantity: "6",
      material: "Cotton",
      shirt_color: "Black",
      print_location: "Front",
    });
    expect(r).toEqual({
      lineTotal: 113.94,
      unitPrice: 113.94,
      orderQuantity: 6,
      isTierPricing: true,
      requiresQuote: false,
    });
    expect(r.lineTotal).not.toBe(113.94 * r.orderQuantity);
  });

  it("Custom T-Shirt: colour / material / print location currently add $0", () => {
    expect(calcLine("custom-t-shirt-printing", { quantity: "12", material: "Polyester" }).lineTotal).toBe(227.88);
    expect(calcLine("custom-t-shirt-printing", { quantity: "48" }).lineTotal).toBe(911.52);
    expect(calcLine("custom-t-shirt-printing", { quantity: "96" }).lineTotal).toBe(1823.04);
  });

  it("Custom Hoodie: quantity tier is the TOTAL order price", () => {
    const r = calcLine("custom-hoodie-printing", {
      quantity: "12",
      hoodie_color: "Navy",
      print_location: "Front and Back",
    });
    expect(r).toEqual({
      lineTotal: 419.88,
      unitPrice: 419.88,
      orderQuantity: 12,
      isTierPricing: true,
      requiresQuote: false,
    });
    expect(r.lineTotal).not.toBe(419.88 * r.orderQuantity);
    expect(calcLine("custom-hoodie-printing", { quantity: "1" }).lineTotal).toBe(34.99);
  });

  it("Custom Hats: base price is $1 and every tier equals the unit count — FROZEN, not fixed", () => {
    // Flagged in docs/PRICING_ARCHITECTURE.md as a Review Item.
    const q = (v: string) => calcLine("custom-hats", { quantity: v }).lineTotal;
    expect(q("1")).toBe(1);
    expect(q("6")).toBe(6);
    expect(q("12")).toBe(12);
    expect(q("48")).toBe(48);
    expect(q("96")).toBe(96);
    expect(
      calcLine("custom-hats", { quantity: "12", hat_style: "Trucker Hat", hat_color: "Black" }),
    ).toEqual({
      lineTotal: 12,
      unitPrice: 12,
      orderQuantity: 12,
      isTierPricing: true,
      requiresQuote: false,
    });
  });

  it("Custom Hats: no quantity → lowest tier ($1)", () => {
    expect(calcLine("custom-hats", {})).toEqual({
      lineTotal: 1,
      unitPrice: 1,
      orderQuantity: 1,
      isTierPricing: true,
      requiresQuote: false,
    });
  });
});

// ---------------------------------------------------------------------------
// Quantity semantics — total order price, never re-multiplied
// ---------------------------------------------------------------------------
describe("Quantity behaviour: tier value is the whole order price", () => {
  const cases: Array<[string, Record<string, string>, number, number]> = [
    ["business-cards-standard", { quantity: "1,000" }, 40.49, 1000],
    ["custom-t-shirt-printing", { quantity: "6" }, 113.94, 6],
    ["postcards", { quantity: "500" }, 39.99, 500],
    ["brochures", { quantity: "2,500" }, 211.74, 2500],
  ];

  it.each(cases)("%s %o → lineTotal %d, orderQuantity %d, not re-multiplied", (slug, opts, total, qty) => {
    const r = calcLine(slug, opts);
    expect(r.lineTotal).toBe(total);
    expect(r.orderQuantity).toBe(qty);
    expect(r.isTierPricing).toBe(true);
    expect(r.lineTotal).not.toBe(total * qty);
  });
});

// ---------------------------------------------------------------------------
// Flat (non-option) pricing — the contrast case: price x quantity
// ---------------------------------------------------------------------------
describe("Flat pricing (custom-mugs — not an option-priced slug)", () => {
  it("multiplies base price by quantity", () => {
    expect(calcLine("custom-mugs", { quantity: "24" })).toEqual({
      lineTotal: 287.76, // 11.99 * 24
      unitPrice: 11.99,
      orderQuantity: 24,
      isTierPricing: false,
      requiresQuote: false,
    });
  });

  it("falls back to PRODUCT_PRICES when the DB price is null", () => {
    const r = calcLineRaw(
      getProductPrice("custom-mugs", null), // → PRODUCT_PRICES["custom-mugs"] = 11.99
      {},
      { quantity: "24" },
      { slug: "custom-mugs", category: "Promotional Products", optionsSchema: seedSchema("custom-mugs") },
    );
    expect(r.lineTotal).toBe(287.76);
    expect(r.unitPrice).toBe(11.99);
    expect(r.isTierPricing).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Base-price ladder (getProductPrice) — precedence 3 → 4 → 5
// ---------------------------------------------------------------------------
describe("Base-price precedence: DB price → PRODUCT_PRICES → $29.99", () => {
  it("uses the DB price when it is a positive number", () => {
    expect(getProductPrice("business-cards-standard", 55)).toBe(55);
    expect(getProductPrice("flyers", 60.5)).toBe(60.5);
  });

  it("falls back to PRODUCT_PRICES when DB price is null / 0 / negative / undefined", () => {
    expect(getProductPrice("business-cards-standard", null)).toBe(29.99);
    expect(getProductPrice("business-cards-standard", 0)).toBe(29.99);
    expect(getProductPrice("business-cards-standard", -3)).toBe(29.99);
    expect(getProductPrice("business-cards-standard", undefined)).toBe(29.99);
    expect(getProductPrice("flyers", null)).toBe(49.99);
    expect(getProductPrice("custom-hats", null)).toBe(14.99); // NOTE: map says 14.99; live DB price is 1.00
  });

  it("uses the hard $29.99 fallback for a completely unknown slug", () => {
    expect(getProductPrice("totally-unknown-slug-xyz", null)).toBe(29.99);
    expect(getProductPrice("totally-unknown-slug-xyz", 7.25)).toBe(7.25);
  });
});

// ---------------------------------------------------------------------------
// DB pricing precedence + partial rules + gap filling (calcLineRaw)
// ---------------------------------------------------------------------------
describe("pricing_rules precedence and gap-filling", () => {
  const ctx = {
    slug: "business-cards-standard",
    category: "Business Cards",
    optionsSchema: seedSchema("business-cards-standard"),
  };

  it("a saved quantity price is used verbatim (beats the synthesized default)", () => {
    // base 40; only the 500 tier is saved
    expect(calcLineRaw(40, { option_prices: { quantity: { "500": 40 } } }, { quantity: "500" }, ctx).lineTotal).toBe(40);
  });

  it("an UNsaved quantity value is synthesized from base x TIER_SCALE", () => {
    // 250 not saved → 40 * 0.85 = 34
    const r = calcLineRaw(40, { option_prices: { quantity: { "500": 40 } } }, { quantity: "250" }, ctx);
    expect(r.lineTotal).toBe(34);
    expect(r.isTierPricing).toBe(true);
  });

  it("an add-on field absent from pricing_rules resolves to 0 (no fall-through to base)", () => {
    const r = calcLineRaw(
      40,
      { option_prices: { quantity: { "500": 40 } } },
      { quantity: "250", sides: "Double Sided", stock: "16pt" },
      ctx,
    );
    expect(r.lineTotal).toBe(34); // 34 + 0 (sides) + 0 (stock)
  });

  it("partial add-on rules: saved value applies, unsaved sibling field stays 0", () => {
    const r = calcLineRaw(
      40,
      { option_prices: { quantity: { "500": 40 }, sides: { "Double Sided": 7 } } },
      { quantity: "250", sides: "Double Sided", stock: "16pt" },
      ctx,
    );
    expect(r.lineTotal).toBe(41); // 34 + 7 (saved sides) + 0 (unsaved stock)
  });

  it("unknown slug with no rules → flat price x quantity, hard fallback base", () => {
    const r = calcLineRaw(
      getProductPrice("mystery-slug", null), // 29.99
      null,
      { quantity: "3" },
      {
        slug: "mystery-slug",
        category: "Nowhere",
        optionsSchema: { fields: [{ name: "quantity", label: "Q", type: "select", options: ["3"], required: true }] },
      },
    );
    expect(r).toEqual({
      lineTotal: 89.97, // 29.99 * 3
      unitPrice: 29.99,
      orderQuantity: 3,
      isTierPricing: false,
      requiresQuote: false,
    });
  });
});

// ---------------------------------------------------------------------------
// normalizePricingRules — shape + legacy shapes
// ---------------------------------------------------------------------------
describe("normalizePricingRules", () => {
  it("returns null for non-objects", () => {
    expect(normalizePricingRules(null)).toBeNull();
    expect(normalizePricingRules(undefined)).toBeNull();
    expect(normalizePricingRules("x")).toBeNull();
    expect(normalizePricingRules(5)).toBeNull();
  });

  it("normalizes {} to { option_prices: {} }", () => {
    expect(normalizePricingRules({})).toEqual({ option_prices: {} });
  });

  it("passes through a modern option_prices map", () => {
    expect(normalizePricingRules({ option_prices: { sides: { A: 1 } } })).toEqual({
      option_prices: { sides: { A: 1 } },
    });
  });

  it("folds legacy quantity_tiers into option_prices.quantity", () => {
    expect(normalizePricingRules({ quantity_tiers: { "500": 49.99 } })).toEqual({
      option_prices: { quantity: { "500": 49.99 } },
    });
  });

  it("folds legacy option_addons into option_prices", () => {
    expect(normalizePricingRules({ option_addons: { finish: { "UV Gloss": 8 } } })).toEqual({
      option_prices: { finish: { "UV Gloss": 8 } },
    });
  });

  it("merges modern option_prices with legacy quantity_tiers", () => {
    expect(
      normalizePricingRules({ option_prices: { quantity: { "250": 25 } }, quantity_tiers: { "500": 30 } }),
    ).toEqual({ option_prices: { quantity: { "250": 25, "500": 30 } } });
  });
});

// ---------------------------------------------------------------------------
// Custom order — exact result shape (checkout depends on requiresQuote)
// ---------------------------------------------------------------------------
describe('"Custom order" quote-required contract', () => {
  it("returns the exact shape checkout expects, regardless of other selections", () => {
    const r = calculateLinePrice(
      29.99,
      normalizePricingRules({ option_prices: { quantity: { "500": 29.99 } } }),
      { quantity: "Custom order", stock: "18pt", finish: "UV Gloss", sides: "Double Sided" },
      { slug: "business-cards-standard", category: "Business Cards", optionsSchema: seedSchema("business-cards-standard") },
    );
    expect(r).toEqual(QUOTE_REQUIRED);
    expect(r.requiresQuote).toBe(true);
    expect(r.lineTotal).toBe(0);
  });

  it("is whitespace-tolerant (\" Custom order \")", () => {
    expect(calcLine("business-cards-standard", { quantity: " Custom order " })).toEqual(QUOTE_REQUIRED);
  });
});
