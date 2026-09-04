import type { Product, OptionsSchema } from "@/lib/types";
import { BUSINESS_CARD_QUANTITY_OPTIONS } from "@/lib/pricing/business-card-quantities";
import { flyerOptionsSchema } from "@/lib/products/options/flyer-options";
import { postcardOptionsSchema } from "@/lib/products/options/postcard-options";
import { brochureOptionsSchema } from "@/lib/products/options/brochure-options";
import { bookmarkOptionsSchema } from "@/lib/products/options/bookmark-options";
import { doorHangerOptionsSchema } from "@/lib/products/options/door-hanger-options";
import { folderOptionsSchema } from "@/lib/products/options/folder-options";
import { posterOptionsSchema } from "@/lib/products/options/poster-options";
import { rollUpBannerOptionsSchema } from "@/lib/products/options/roll-up-banner-options";
import { carDoorMagnetOptionsSchema } from "@/lib/products/options/car-door-magnet-options";
import {
  aFrameSignsOptionsSchema,
  aFrameStandsOptionsSchema,
  adhesiveVinylOptionsSchema,
  aluminumSignsOptionsSchema,
  bannersOptionsSchema,
  canvasPrintsOptionsSchema,
  coroplastSignsOptionsSchema,
  displayBoardPopOptionsSchema,
  floorGraphicsOptionsSchema,
  foamBoardOptionsSchema,
  hStandsOptionsSchema,
  largeFormatPostersOptionsSchema,
  sintraPvcOptionsSchema,
  styreneSignsOptionsSchema,
  tableCoversOptionsSchema,
  wallDecalsOptionsSchema,
  windowGraphicsOptionsSchema,
  xFrameBannersOptionsSchema,
} from "@/lib/products/options/large-format-options";
import { largeFormatProductImage } from "@/lib/products/options/large-format-options-shared";
import {
  apparelPrintingOptionsSchema,
  APPAREL_QUANTITY_OPTIONS,
  BASIC_APPAREL_COLORS,
} from "@/lib/products/options/apparel-options";
import { withDesignHelpField } from "@/lib/products/options/product-options-shared";

const BUSINESS_CARD_IMAGE =
  "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop";

const standardBusinessCardOptions: OptionsSchema = {
  fields: [
    {
      name: "quantity",
      label: "Quantity",
      type: "select",
      options: [...BUSINESS_CARD_QUANTITY_OPTIONS],
      required: true,
    },
    {
      name: "stock",
      label: "Stock",
      type: "select",
      options: ["14pt", "16pt", "18pt"],
      required: true,
    },
    {
      name: "finish",
      label: "Finish",
      type: "select",
      options: ["Matte", "UV Gloss"],
      required: true,
    },
    {
      name: "corners",
      label: "Corners",
      type: "select",
      options: ["Rectangle", "Rounded"],
      required: true,
    },
    {
      name: "sides",
      label: "Sides",
      type: "select",
      options: ["Single Sided", "Double Sided"],
      required: true,
    },
    {
      name: "need_design_help",
      label: "Need Design Help",
      type: "radio",
      options: ["Yes", "No"],
      required: true,
    },
  ],
};

const BC_SIZE = ['3.5" x 2"'];
const BC_QUANTITY = [...BUSINESS_CARD_QUANTITY_OPTIONS];
const BC_CORNERS = ["Rectangle", "Rounded"];
const BC_SIDES = ["Single Sided", "Double Sided"];

const BC_LAMINATION_FIELD: OptionsSchema["fields"][number] = {
  name: "lamination",
  label: "Lamination",
  type: "select",
  options: ["Matte Lamination 2 Sided", "Soft Touch Lamination 2 Sided"],
  required: true,
};

const PAINTED_EDGE_COLORS = [
  "Metallic Yellow",
  "Blue",
  "Black",
  "Yellow",
  "Metallic Hot Pink",
  "Metallic Green",
  "Orange",
  "Purple",
  "Brown",
  "Metallic Purple",
  "Turquoise",
  "Red",
  "Metallic Blue",
  "Pink",
  "Metallic Gold",
  "White (Not Painted)",
  "Metallic Orange",
];

function premiumBaseOptions(extraFields: OptionsSchema["fields"] = []): OptionsSchema {
  return {
    fields: [
      {
        name: "quantity",
        label: "Quantity",
        type: "select",
        options: BC_QUANTITY,
        required: true,
      },
      {
        name: "size",
        label: "Size",
        type: "select",
        options: BC_SIZE,
        required: true,
      },
      ...extraFields,
      {
        name: "corners",
        label: "Corners",
        type: "select",
        options: BC_CORNERS,
        required: true,
      },
      {
        name: "sides",
        label: "Sides",
        type: "select",
        options: BC_SIDES,
        required: true,
      },
      {
        name: "need_design_help",
        label: "Need Design Help",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
      },
    ],
  };
}

type SeedProduct = Omit<Product, "id" | "created_at" | "price">;

function premiumProduct(
  title: string,
  slug: string,
  description: string,
  options: OptionsSchema,
  basePriceText = "Starting at $34/100",
  subcategory: "Premium" | "Custom" = "Premium"
): SeedProduct {
  return {
    title,
    slug,
    category: "Business Cards",
    subcategory,
    description,
    base_price_text: basePriceText,
    image_url: BUSINESS_CARD_IMAGE,
    active: true,
    options_schema: options,
  };
}

const quantityPrint = (opts: string[]): OptionsSchema => ({
  fields: [
    {
      name: "quantity",
      label: "Quantity",
      type: "select",
      options: opts,
      required: true,
    },
    {
      name: "need_design_help",
      label: "Need Design Help",
      type: "radio",
      options: ["Yes", "No"],
      required: true,
    },
  ],
});

const SEED_PRODUCTS_BASE: Omit<Product, "id" | "created_at" | "price">[] = [
  // Apparel
  {
    title: "Custom T-Shirt Printing",
    slug: "custom-t-shirt-printing",
    category: "Apparel",
    description:
      "High-quality custom t-shirt printing for events, teams, and businesses. Screen print and DTG options available.",
    base_price_text: "Starting at $12/shirt",
    image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop",
    active: true,
    options_schema: apparelPrintingOptionsSchema({
      colorName: "shirt_color",
      colorLabel: "Shirt Color",
      includeMaterial: true,
    }),
  },
  {
    title: "Custom Long-Sleeve T-Shirt Printing",
    slug: "custom-long-sleeve-t-shirt-printing",
    category: "Apparel",
    description:
      "Custom printed long-sleeve T-shirts for teams, businesses, events, and branded apparel.",
    base_price_text: "Starting at $24.99/shirt",
    image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop",
    active: true,
    options_schema: apparelPrintingOptionsSchema({
      colorName: "shirt_color",
      colorLabel: "Shirt Color",
      includeMaterial: true,
    }),
  },
  {
    title: "Custom Polo Printing",
    slug: "custom-polo-printing",
    category: "Apparel",
    description:
      "Professional custom printed polos for corporate teams, uniforms, and events.",
    base_price_text: "Starting at $18/polo",
    image_url:
      "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    active: true,
    options_schema: apparelPrintingOptionsSchema({
      colorName: "polo_color",
      colorLabel: "Polo Color",
    }),
  },
  {
    title: "Custom Hoodie Printing",
    slug: "custom-hoodie-printing",
    category: "Apparel",
    description:
      "Premium hoodie printing for brands, schools, and organizations.",
    base_price_text: "Starting at $28/hoodie",
    image_url:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop",
    active: true,
    options_schema: apparelPrintingOptionsSchema({
      colorName: "hoodie_color",
      colorLabel: "Hoodie Color",
    }),
  },
  {
    title: "Custom Hats",
    slug: "custom-hats",
    category: "Apparel",
    description:
      "Custom embroidered or printed trucker hats and baseball caps for your brand.",
    base_price_text: "Starting at $10/hat",
    image_url:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: [...APPAREL_QUANTITY_OPTIONS],
          required: true,
        },
        {
          name: "hat_style",
          label: "Hat Style",
          type: "select",
          options: ["Trucker Hat", "Baseball Cap"],
          required: true,
        },
        {
          name: "hat_color",
          label: "Hat Color",
          type: "select",
          options: [...BASIC_APPAREL_COLORS],
          required: true,
        },
      ],
    },
  },
  {
    title: "Tote Bags",
    slug: "tote-bags",
    category: "Apparel",
    description:
      "Custom printed tote bags for retail, events, and promotional giveaways.",
    base_price_text: "Starting at $8/bag",
    image_url:
      "https://images.unsplash.com/photo-1591562555315-8019a069fd93?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["25", "50", "100", "250", "500"],
          required: true,
        },
        {
          name: "bag_color",
          label: "Bag Color",
          type: "text",
          placeholder: "e.g. Natural, Black, Navy",
          required: true,
        },
        {
          name: "print_sides",
          label: "Print Sides",
          type: "select",
          options: ["One Side", "Both Sides"],
          required: true,
        },
      ],
    },
  },

  // Business Cards (MKT1)
  {
    title: "Standard Business Cards",
    slug: "business-cards-standard",
    category: "Business Cards",
    subcategory: "Standard",
    description:
      "Standard business cards from MetroPrint USA (MKT1). Choose stock weight, matte or UV gloss finish, corner style, quantity, and sides.",
    base_price_text: "Starting at $29/500",
    image_url: BUSINESS_CARD_IMAGE,
    active: true,
    options_schema: standardBusinessCardOptions,
  },
  premiumProduct(
    "Metallic Foil Business Cards",
    "business-cards-premium-metallic-foil-raised",
    "Raised foil business cards with silver or gold custom foil printing. High-end look for professional branding — MetroPrint USA (MKT1).",
    premiumBaseOptions([
      {
        name: "foil_color",
        label: "Foil Color",
        type: "select",
        options: [
          "Gold metallic foil (front)",
          "Silver metallic foil (front)",
          "Gold metallic foil (both sides)",
          "Silver metallic foil (both sides)",
        ],
        required: true,
      },
      BC_LAMINATION_FIELD,
    ]),
    "Starting at $43/100"
  ),
  premiumProduct(
    "Kraft Paper Business Cards",
    "business-cards-premium-kraft-paper",
    "Natural kraft business cards with a rustic, eco-friendly look. 100% recyclable — best for bold, dark-colored designs. MetroPrint USA (MKT1).",
    premiumBaseOptions()
  ),
  premiumProduct(
    "Durable Business Cards",
    "business-cards-premium-durable",
    "Waterproof and tear-resistant synthetic business cards. 100% recyclable and built to last in tough conditions — MetroPrint USA (MKT1).",
    premiumBaseOptions()
  ),
  premiumProduct(
    "Spot UV Business Cards",
    "business-cards-premium-spot-uv-raised",
    "Laminated business cards with raised clear spot UV gloss applied to areas of your choice. Adds tactile, premium detail — MetroPrint USA (MKT1).",
    premiumBaseOptions([
      BC_LAMINATION_FIELD,
      {
        name: "spot_uv",
        label: "Spot UV",
        type: "select",
        options: ["One sided", "Both sides"],
        required: true,
      },
    ]),
    "Starting at $44/100"
  ),
  premiumProduct(
    "Soft Touch Business Cards",
    "business-cards-premium-soft-touch-suede",
    "Soft touch (suede) business cards with a luxurious velvet-like surface. 19pt thickness with scratch and smudge protection — MetroPrint USA (MKT1).",
    premiumBaseOptions(),
    "Starting at $27/25"
  ),
  premiumProduct(
    "32pt Painted Edge Business Cards",
    "business-cards-premium-32pt-painted-edge",
    "Thick 32pt uncoated business cards with painted colored edges. Choose from popular edge colors for a bold first impression — MetroPrint USA (MKT1).",
    {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: [...BUSINESS_CARD_QUANTITY_OPTIONS],
          required: true,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: BC_SIZE,
          required: true,
        },
        {
          name: "paint_color",
          label: "Edge Color",
          type: "select",
          options: PAINTED_EDGE_COLORS,
          required: true,
        },
        {
          name: "sides",
          label: "Sides",
          type: "select",
          options: BC_SIDES,
          required: true,
        },
        {
          name: "need_design_help",
          label: "Need Design Help",
          type: "radio",
          options: ["Yes", "No"],
          required: true,
        },
      ],
    },
    "Starting at $54/250"
  ),
  premiumProduct(
    "Fold-over Business Cards",
    "business-cards-specialty-fold-over",
    "Fold-over business cards that open to reveal extra space for your message, logo, or offer — MetroPrint USA (MKT1).",
    {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: BC_QUANTITY,
          required: true,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: ['2" x 7"', '3.5" x 4"'],
          required: true,
        },
        {
          name: "finish",
          label: "Finish",
          type: "select",
          options: ["Matte", "UV Gloss", "Soft Touch"],
          required: true,
        },
        {
          name: "need_design_help",
          label: "Need Design Help",
          type: "radio",
          options: ["Yes", "No"],
          required: true,
        },
      ],
    },
    "Starting at $37/100",
    "Custom"
  ),
  premiumProduct(
    "Plastic Business Cards",
    "business-cards-specialty-plastic",
    "Durable plastic business cards in clear, frosted, or white — choose oval or rounded corners. MetroPrint USA (MKT1).",
    {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: BC_QUANTITY,
          required: true,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: ['2" x 3.5"'],
          required: true,
        },
        {
          name: "shape",
          label: "Shape",
          type: "select",
          options: ["Rounded 4 Corners", "Oval"],
          required: true,
        },
        {
          name: "plastic_type",
          label: "Plastic Type",
          type: "select",
          options: ["Clear Plastic", "Frosted Plastic", "White Plastic"],
          required: true,
        },
        {
          name: "colorspec",
          label: "Color Spec",
          type: "select",
          options: ["4/0 (4 color front)", "4/4 (4 color both sides)"],
          required: true,
        },
        {
          name: "need_design_help",
          label: "Need Design Help",
          type: "radio",
          options: ["Yes", "No"],
          required: true,
        },
      ],
    },
    "Starting at $35/100",
    "Custom"
  ),
  premiumProduct(
    "Magnetic Business Cards",
    "business-cards-specialty-magnetic",
    "Magnetic business cards that stick to fridges, filing cabinets, and metal surfaces — MetroPrint USA (MKT1).",
    {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: BC_QUANTITY,
          required: true,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: ['2" x 3.5"'],
          required: true,
        },
        {
          name: "shape",
          label: "Shape",
          type: "select",
          options: ["Rounded 4 Corners", "Rectangle", "Oval"],
          required: true,
        },
        {
          name: "corner_radius",
          label: "Radius of Corners",
          type: "select",
          options: ['1/8"', '3/16"', '1/4"', "N/A (Rectangle or Oval)"],
          required: true,
        },
        {
          name: "need_design_help",
          label: "Need Design Help",
          type: "radio",
          options: ["Yes", "No"],
          required: true,
        },
      ],
    },
    "Starting at $40/100",
    "Custom"
  ),

  // Print Materials
  {
    title: "Flyers",
    slug: "flyers",
    category: "Print Materials",
    description: "Eye-catching flyers for promotions, events, and marketing campaigns.",
    base_price_text: "Starting at $49/500",
    image_url:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop",
    active: true,
    options_schema: flyerOptionsSchema(),
  },
  {
    title: "Postcards",
    slug: "postcards",
    category: "Print Materials",
    description:
      "Custom postcards for direct mail, promotions, and events. Choose size, 14pt or 16pt C2S stock, quantity, and sides — upload your artwork at checkout.",
    base_price_text: "Starting at $39/500",
    image_url:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop",
    active: true,
    options_schema: postcardOptionsSchema(),
  },
  {
    title: "Brochures",
    slug: "brochures",
    category: "Print Materials",
    description: "Custom folded brochures for menus, mailers, guides, and marketing materials.",
    base_price_text: "Starting at $89/250",
    image_url:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
    active: true,
    options_schema: brochureOptionsSchema(),
  },
  {
    title: "Posters",
    slug: "posters",
    category: "Print Materials",
    description: "Large format posters for retail, events, and advertising.",
    base_price_text: "Starting at $15/poster",
    image_url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop",
    active: true,
    options_schema: posterOptionsSchema(),
  },
  {
    title: "Door Hangers",
    slug: "door-hangers",
    category: "Print Materials",
    description: "Door hanger marketing for local promotions and service businesses.",
    base_price_text: "Starting at $59/500",
    image_url:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&h=600&fit=crop",
    active: true,
    options_schema: doorHangerOptionsSchema(),
  },
  {
    title: "Bookmarks",
    slug: "bookmarks",
    category: "Print Materials",
    description: "Custom bookmarks for libraries, schools, and promotional campaigns.",
    base_price_text: "Starting at $39/500",
    image_url:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop",
    active: true,
    options_schema: bookmarkOptionsSchema(),
  },
  {
    title: "Folders",
    slug: "folders",
    category: "Print Materials",
    description: "Presentation folders with pockets for sales materials and proposals.",
    base_price_text: "Starting at $99/100",
    image_url:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop",
    active: true,
    options_schema: folderOptionsSchema(),
  },

  // Large Format
  {
    title: "Coroplast Signs & Yard Signs",
    slug: "coroplast-signs",
    category: "Large Format",
    description:
      "Durable coroplast signs — a great option for outdoor yard signage and campaigns.",
    base_price_text: "Starting at $19/sign",
    image_url: largeFormatProductImage("coroplast-signs"),
    active: true,
    options_schema: coroplastSignsOptionsSchema(),
  },
  {
    title: "Floor Graphics",
    slug: "floor-graphics",
    category: "Large Format",
    description:
      "Removable vinyl floor graphics that are safe, long-lasting, and ideal for retail or events.",
    base_price_text: "Starting at $29/graphic",
    image_url: largeFormatProductImage("floor-graphics"),
    active: true,
    options_schema: floorGraphicsOptionsSchema(),
  },
  {
    title: "Foam Board",
    slug: "foam-board",
    category: "Large Format",
    description: "Lightweight foam board signs ideal for indoor displays and events.",
    base_price_text: "Starting at $24/sign",
    image_url: largeFormatProductImage("foam-board"),
    active: true,
    options_schema: foamBoardOptionsSchema(),
  },
  {
    title: "Aluminum Signs",
    slug: "aluminum-signs",
    category: "Large Format",
    description: "Durable metal signage perfect for outdoor use and long-term branding.",
    base_price_text: "Starting at $49/sign",
    image_url: largeFormatProductImage("aluminum-signs"),
    active: true,
    options_schema: aluminumSignsOptionsSchema(),
  },
  {
    title: "Banners",
    slug: "banners",
    category: "Large Format",
    description:
      "Vinyl and mesh banners — a cost-effective, portable way to communicate your message.",
    base_price_text: "Starting at $39/banner",
    image_url: largeFormatProductImage("banners"),
    active: true,
    options_schema: bannersOptionsSchema(),
  },
  {
    title: "Pull Up Banners",
    slug: "roll-up-banners",
    category: "Large Format",
    description:
      "Portable pull-up banners for trade shows, events, and retail displays.",
    base_price_text: "Starting at $89/banner",
    image_url: largeFormatProductImage("roll-up-banners"),
    active: true,
    options_schema: rollUpBannerOptionsSchema(),
  },
  {
    title: "Car Magnets",
    slug: "car-door-magnets",
    category: "Large Format",
    description:
      "Thick removable car door magnets for fleet branding and local business advertising.",
    base_price_text: "Starting at $49.99",
    image_url: largeFormatProductImage("car-door-magnets"),
    active: true,
    options_schema: carDoorMagnetOptionsSchema(),
  },
  {
    title: "Table Covers",
    slug: "table-covers",
    category: "Large Format",
    description:
      "Custom table covers for 6' or 8' tables at trade shows, conventions, and events.",
    base_price_text: "Starting at $129/cover",
    image_url: largeFormatProductImage("table-covers"),
    active: true,
    options_schema: tableCoversOptionsSchema(),
  },
  {
    title: "Adhesive Vinyl",
    slug: "adhesive-vinyl",
    category: "Large Format",
    description:
      "Glossy adhesive vinyl for POP displays, trade show graphics, and permanent wall applications.",
    base_price_text: "Starting at $34/sq ft",
    image_url: largeFormatProductImage("adhesive-vinyl"),
    active: true,
    options_schema: adhesiveVinylOptionsSchema(),
  },
  {
    title: "Window Graphics",
    slug: "window-graphics",
    category: "Large Format",
    description:
      "Perforated vinyl window graphics to enhance storefronts and stand out with your message.",
    base_price_text: "Starting at $39/graphic",
    image_url: largeFormatProductImage("window-graphics"),
    active: true,
    options_schema: windowGraphicsOptionsSchema(),
  },
  {
    title: "Large Format Posters",
    slug: "large-format-posters",
    category: "Large Format",
    description:
      "Large format posters printed on semi-gloss card stock for retail, events, and advertising.",
    base_price_text: "Starting at $29/poster",
    image_url: largeFormatProductImage("large-format-posters"),
    active: true,
    options_schema: largeFormatPostersOptionsSchema(),
  },
  {
    title: "Styrene Signs",
    slug: "styrene-signs",
    category: "Large Format",
    description: "Lightweight yet durable PVC styrene sheets for indoor and outdoor signage.",
    base_price_text: "Starting at $34/sign",
    image_url: largeFormatProductImage("styrene-signs"),
    active: true,
    options_schema: styreneSignsOptionsSchema(),
  },
  {
    title: "Display Board / POP",
    slug: "display-board-pop",
    category: "Large Format",
    description:
      "Thick semi-gloss display board for posters, signage, and point-of-purchase advertising.",
    base_price_text: "Starting at $44/sign",
    image_url: largeFormatProductImage("display-board-pop"),
    active: true,
    options_schema: displayBoardPopOptionsSchema(),
  },
  {
    title: "Canvas",
    slug: "canvas-prints",
    category: "Large Format",
    description:
      "Canvas rolls and stretched canvas prints for photography, art, and décor.",
    base_price_text: "Starting at $59/print",
    image_url: largeFormatProductImage("canvas-prints"),
    active: true,
    options_schema: canvasPrintsOptionsSchema(),
  },
  {
    title: "Sintra / PVC",
    slug: "sintra-pvc",
    category: "Large Format",
    description:
      "Lightweight, durable Sintra PVC — an excellent choice for outdoor signage.",
    base_price_text: "Starting at $39/sign",
    image_url: largeFormatProductImage("sintra-pvc"),
    active: true,
    options_schema: sintraPvcOptionsSchema(),
  },
  {
    title: "X-Frame Banners",
    slug: "x-frame-banners",
    category: "Large Format",
    description:
      "X-frame banner displays for events, trade shows, and in-store promotions.",
    base_price_text: "Starting at $79/banner",
    image_url: largeFormatProductImage("x-frame-banners"),
    active: true,
    options_schema: xFrameBannersOptionsSchema(),
  },
  {
    title: "A-Frame Signs",
    slug: "a-frame-signs",
    category: "Large Format",
    description:
      "Portable A-frame coroplast signs that capture attention from passing customers.",
    base_price_text: "Starting at $49/sign",
    image_url: largeFormatProductImage("a-frame-signs"),
    active: true,
    options_schema: aFrameSignsOptionsSchema(),
  },
  {
    title: "Wall Decals",
    slug: "wall-decals",
    category: "Large Format",
    description: "Removable vinyl wall decals for custom interior branding and décor.",
    base_price_text: "Starting at $29/decal",
    image_url: largeFormatProductImage("wall-decals"),
    active: true,
    options_schema: wallDecalsOptionsSchema(),
  },
  {
    title: "A Frame Stands",
    slug: "a-frame-stands",
    category: "Large Format",
    description:
      "A-frame stands that hold signs on both sides for bidirectional promotions.",
    base_price_text: "Starting at $89/stand",
    image_url: largeFormatProductImage("a-frame-stands"),
    active: true,
    options_schema: aFrameStandsOptionsSchema(),
  },
  {
    title: "H Stands for Signs",
    slug: "h-stands",
    category: "Large Format",
    description: "H-stands to keep coroplast yard signs upright on lawns and sidewalks.",
    base_price_text: "Starting at $12/stand",
    image_url: largeFormatProductImage("h-stands"),
    active: true,
    options_schema: hStandsOptionsSchema(),
  },

  // Promotional Products
  {
    title: "Custom Mugs",
    slug: "custom-mugs",
    category: "Promotional Products",
    description: "Branded ceramic mugs for corporate gifts and promotional campaigns.",
    base_price_text: "Starting at $8/mug",
    image_url:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=600&fit=crop",
    active: true,
    options_schema: quantityPrint(["12", "24", "48", "72", "144"]),
  },
  {
    title: "Custom Tumblers",
    slug: "custom-tumblers",
    category: "Promotional Products",
    description: "Insulated tumblers with your logo for lasting brand visibility.",
    base_price_text: "Starting at $12/tumbler",
    image_url:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=600&fit=crop",
    active: true,
    options_schema: quantityPrint(["12", "24", "48", "72", "144"]),
  },
  {
    title: "Branded Merchandise",
    slug: "branded-merchandise",
    category: "Promotional Products",
    description: "Custom branded merchandise packages for events, clients, and employees.",
    base_price_text: "Custom pricing",
    image_url:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Estimated Quantity",
          type: "select",
          options: ["25", "50", "100", "250", "500+"],
          required: true,
        },
        {
          name: "item_types",
          label: "Item Types Needed",
          type: "textarea",
          placeholder: "e.g. Pens, notebooks, USB drives, keychains",
          required: true,
        },
        {
          name: "budget",
          label: "Budget Range",
          type: "text",
          placeholder: "e.g. $500–$1,000",
          required: false,
        },
      ],
    },
  },

  // Marketing Services
  {
    title: "Graphic Design Services",
    slug: "graphic-design-services",
    category: "Marketing Services",
    description: "Professional graphic design for print, digital, and brand materials.",
    base_price_text: "Starting at $75/hr",
    image_url:
      "https://images.unsplash.com/photo-1561070791-2520d4200b47?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "project_type",
          label: "Project Type",
          type: "select",
          options: [
            "Logo Design",
            "Print Design",
            "Social Media Graphics",
            "Packaging",
            "Other",
          ],
          required: true,
        },
        {
          name: "deadline",
          label: "Desired Deadline",
          type: "text",
          placeholder: "e.g. 2 weeks",
          required: false,
        },
      ],
    },
  },
  {
    title: "Branding",
    slug: "branding",
    category: "Marketing Services",
    description: "Complete brand identity packages including logo, colors, and guidelines.",
    base_price_text: "Packages from $499",
    image_url:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "package_level",
          label: "Package Level",
          type: "select",
          options: ["Starter", "Professional", "Enterprise"],
          required: true,
        },
        {
          name: "deliverables",
          label: "Deliverables Needed",
          type: "textarea",
          placeholder: "e.g. Logo, business cards, letterhead, brand guide",
          required: true,
        },
      ],
    },
  },
  {
    title: "Social Media Management",
    slug: "social-media-management",
    category: "Marketing Services",
    description: "Consistent social media content and management to grow your brand online.",
    base_price_text: "Plans from $299/mo",
    image_url:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "platforms",
          label: "Platforms",
          type: "text",
          placeholder: "e.g. Instagram, Facebook, LinkedIn",
          required: true,
        },
        {
          name: "posting_frequency",
          label: "Posting Frequency",
          type: "select",
          options: ["3 posts/week", "5 posts/week", "Daily"],
          required: true,
        },
      ],
    },
  },
  {
    title: "Video Production",
    slug: "video-production",
    category: "Marketing Services",
    description: "Professional video production for commercials, promos, and social content.",
    base_price_text: "Projects from $999",
    image_url:
      "https://images.unsplash.com/photo-1492691527719-9d1e37e684fb?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "video_type",
          label: "Video Type",
          type: "select",
          options: [
            "Commercial",
            "Promotional",
            "Social Media",
            "Event Coverage",
            "Other",
          ],
          required: true,
        },
        {
          name: "duration",
          label: "Estimated Duration",
          type: "text",
          placeholder: "e.g. 30 seconds, 2 minutes",
          required: false,
        },
      ],
    },
  },
  {
    title: "Content Creation",
    slug: "content-creation",
    category: "Marketing Services",
    description: "Blog posts, copywriting, and content strategy for your business.",
    base_price_text: "Starting at $50/piece",
    image_url:
      "https://images.unsplash.com/photo-1455390572245-444bebb8ee83?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "content_type",
          label: "Content Type",
          type: "select",
          options: [
            "Blog Posts",
            "Website Copy",
            "Email Campaigns",
            "Product Descriptions",
            "Other",
          ],
          required: true,
        },
        {
          name: "quantity",
          label: "Number of Pieces",
          type: "select",
          options: ["1", "5", "10", "Ongoing"],
          required: true,
        },
      ],
    },
  },

];

/** Every storefront product offers the same artwork/design-assistance choice. */
export const SEED_PRODUCTS: Omit<Product, "id" | "created_at" | "price">[] =
  SEED_PRODUCTS_BASE.map((product) => ({
    ...product,
    options_schema: withDesignHelpField(product.options_schema),
  }));

export function getSeedProductBySlug(slug: string) {
  return SEED_PRODUCTS.find((p) => p.slug === slug);
}

export function getSeedProductsByCategory(category: string) {
  return SEED_PRODUCTS.filter((p) => p.category === category);
}

export const POPULAR_PRODUCT_SLUGS = [
  "business-cards-standard",
  "custom-t-shirt-printing",
  "flyers",
  "graphic-design-services",
  "roll-up-banners",
  "coroplast-signs",
];
