import {
  largeFormatOptions,
  LF_BANNER_SIZES,
  LF_CANVAS_SIZES,
  LF_FLOOR_GRAPHIC_SIZES,
  LF_YARD_SIGN_SIZES,
  selectField,
} from "@/lib/products/options/large-format-options-shared";
import type { OptionsSchema } from "@/lib/types";

export const COROPLAST_SIGNS_SLUG = "coroplast-signs";
export const FLOOR_GRAPHICS_SLUG = "floor-graphics";
export const FOAM_BOARD_SLUG = "foam-board";
export const ALUMINUM_SIGNS_SLUG = "aluminum-signs";
export const BANNERS_SLUG = "banners";
export const TABLE_COVERS_SLUG = "table-covers";
export const ADHESIVE_VINYL_SLUG = "adhesive-vinyl";
export const WINDOW_GRAPHICS_SLUG = "window-graphics";
export const LARGE_FORMAT_POSTERS_SLUG = "large-format-posters";
export const STYRENE_SIGNS_SLUG = "styrene-signs";
export const DISPLAY_BOARD_POP_SLUG = "display-board-pop";
export const CANVAS_PRINTS_SLUG = "canvas-prints";
export const SINTRA_PVC_SLUG = "sintra-pvc";
export const X_FRAME_BANNERS_SLUG = "x-frame-banners";
export const A_FRAME_SIGNS_SLUG = "a-frame-signs";
export const WALL_DECALS_SLUG = "wall-decals";
export const A_FRAME_STANDS_SLUG = "a-frame-stands";
export const H_STANDS_SLUG = "h-stands";

export function coroplastSignsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", [
      "4mm Coroplast (Yard signs)",
      "6mm Coroplast",
      "8mm Coroplast",
      "10mm Coroplast",
    ]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function floorGraphicsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("graphic_type", "Graphic Type", [
      "Floor Graphics",
      "Social Distancing Floor Graphics",
    ]),
    selectField("size", "Size", LF_FLOOR_GRAPHIC_SIZES),
  ]);
}

export function foamBoardOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["4mm Foam Board"]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function aluminumSignsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["3mm Aluminum Signs"]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function bannersOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", [
      "13oz Glossy Vinyl",
      "13oz Matte Vinyl",
      "8oz Polyester Mesh",
    ]),
    selectField("size", "Size", LF_BANNER_SIZES),
  ]);
}

export function tableCoversOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("table_size", "Table Size", [
      "Table Covers (6 ft Table)",
      "Table Covers (8 ft Table)",
    ]),
  ]);
}

export function adhesiveVinylOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["Glossy Adhesive Vinyl"]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function windowGraphicsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["Perforated Vinyl"]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function largeFormatPostersOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["8pt C2S"]),
    selectField("size", "Size", ['18" x 24"', '24" x 36"', '36" x 48"']),
  ]);
}

export function styreneSignsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["20pt Styrene"]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function displayBoardPopOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["24pt Display Board", "40pt Display Board"]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function canvasPrintsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("canvas_type", "Canvas Type", [
      "Canvas Roll",
      "Stretched Canvas Prints",
    ]),
    selectField("size", "Size", LF_CANVAS_SIZES),
  ]);
}

export function sintraPvcOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["3mm PVC"]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function xFrameBannersOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["13oz Matte Vinyl"]),
    selectField("size", "Size", ['24" x 63"', '32" x 71"', '33" x 81"']),
  ]);
}

export function aFrameSignsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["4mm Coroplast"]),
    selectField("size", "Size", ['18" x 24"', '24" x 36"']),
  ]);
}

export function wallDecalsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("material", "Material", ["7 mil Removable Wall Decal"]),
    selectField("size", "Size", LF_YARD_SIGN_SIZES),
  ]);
}

export function aFrameStandsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("stand_type", "Stand Type", ["A Frame Stands"]),
  ]);
}

export function hStandsOptionsSchema(): OptionsSchema {
  return largeFormatOptions([
    selectField("stand_type", "Stand Type", ["H Stands"]),
  ]);
}
