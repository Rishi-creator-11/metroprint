import type { Product, OptionsSchema } from "./types";

const BUSINESS_CARD_IMAGE =
  "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop";

const standardBusinessCardOptions: OptionsSchema = {
  fields: [
    {
      name: "quantity",
      label: "Quantity",
      type: "select",
      options: ["50", "100", "250", "500", "1000", "2500", "5000"],
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
const BC_QUANTITY = ["25", "50", "100", "250", "500", "1000", "2500"];
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

function premiumProduct(
  title: string,
  slug: string,
  description: string,
  options: OptionsSchema,
  basePriceText = "Starting at $34/100"
): SeedProduct {
  return {
    title,
    slug,
    category: "Business Cards",
    description,
    base_price_text: basePriceText,
    image_url: BUSINESS_CARD_IMAGE,
    active: true,
    options_schema: options,
  };
}

const businessCardOptions = (cardType: string): OptionsSchema => ({
  fields: [
    {
      name: "quantity",
      label: "Quantity",
      type: "select",
      options: ["50", "100", "250", "500", "1000", "2500", "5000"],
      required: true,
    },
    {
      name: "finish",
      label: "Card Type",
      type: "select",
      options: [cardType],
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
});

type SeedProduct = Omit<Product, "id" | "created_at" | "price">;

function businessCardProduct(
  line: "Standard" | "Premium" | "Specialty",
  cardType: string,
  slug: string,
  description?: string
): SeedProduct {
  const title = `${line} ${cardType} Business Cards`;
  return {
    title,
    slug,
    category: "Business Cards",
    description:
      description ||
      `${line} ${cardType} business cards from MetroPrint USA (MKT1). Upload your artwork, choose quantity and sides, and checkout online.`,
    base_price_text: "Starting at $29/500",
    image_url: BUSINESS_CARD_IMAGE,
    active: true,
    options_schema: businessCardOptions(cardType),
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

export const SEED_PRODUCTS: Omit<Product, "id" | "created_at" | "price">[] = [
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
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["1", "5", "10", "25", "50", "100"],
          required: true,
        },
        {
          name: "shirt_color",
          label: "Shirt Color",
          type: "text",
          placeholder: "e.g. Navy, White, Black",
          required: true,
        },
        {
          name: "print_location",
          label: "Print Location",
          type: "select",
          options: ["Front", "Back", "Front and Back"],
          required: true,
        },
        {
          name: "size_breakdown",
          label: "Size Breakdown",
          type: "textarea",
          placeholder: "e.g. S:2, M:5, L:8, XL:3",
          required: false,
        },
      ],
    },
  },
  {
    title: "Custom Polo Printing",
    slug: "custom-polo-printing",
    category: "Apparel",
    description:
      "Professional embroidered or printed polos for corporate teams and events.",
    base_price_text: "Starting at $18/polo",
    image_url:
      "https://images.unsplash.com/photo-1622445275463-aba1ab721103?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["1", "5", "10", "25", "50", "100"],
          required: true,
        },
        {
          name: "polo_color",
          label: "Polo Color",
          type: "text",
          placeholder: "e.g. Navy, White",
          required: true,
        },
        {
          name: "print_location",
          label: "Print/Embroidery Location",
          type: "select",
          options: ["Left Chest", "Full Front", "Back", "Sleeve"],
          required: true,
        },
        {
          name: "size_breakdown",
          label: "Size Breakdown",
          type: "textarea",
          placeholder: "e.g. S:2, M:5, L:8",
          required: false,
        },
      ],
    },
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
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["1", "5", "10", "25", "50", "100"],
          required: true,
        },
        {
          name: "hoodie_color",
          label: "Hoodie Color",
          type: "text",
          placeholder: "e.g. Black, Gray, Navy",
          required: true,
        },
        {
          name: "print_location",
          label: "Print Location",
          type: "select",
          options: ["Front", "Back", "Front and Back"],
          required: true,
        },
        {
          name: "size_breakdown",
          label: "Size Breakdown",
          type: "textarea",
          placeholder: "e.g. S:2, M:5, L:8, XL:3",
          required: false,
        },
      ],
    },
  },
  {
    title: "Custom Hats",
    slug: "custom-hats",
    category: "Apparel",
    description:
      "Embroidered or printed caps, beanies, and trucker hats for your brand.",
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
          options: ["12", "24", "48", "72", "144"],
          required: true,
        },
        {
          name: "hat_style",
          label: "Hat Style",
          type: "select",
          options: ["Structured Cap", "Trucker Hat", "Beanie", "Snapback"],
          required: true,
        },
        {
          name: "hat_color",
          label: "Hat Color",
          type: "text",
          placeholder: "e.g. Black, Navy, Khaki",
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
          options: ["100", "250", "500", "1000", "2500"],
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
    "Starting at $37/100"
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
    "Starting at $35/100"
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
    "Starting at $40/100"
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
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["50", "100", "250", "500", "1000"],
          required: true,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: ['8.5" x 11"', '5.5" x 8.5"', '4" x 6"'],
          required: true,
        },
        {
          name: "paper_type",
          label: "Paper Type",
          type: "select",
          options: ["100lb Gloss", "100lb Matte", "80lb Text"],
          required: true,
        },
        {
          name: "sides",
          label: "Sides",
          type: "select",
          options: ["Single Sided", "Double Sided"],
          required: true,
        },
      ],
    },
  },
  {
    title: "Brochures",
    slug: "brochures",
    category: "Print Materials",
    description: "Tri-fold and bi-fold brochures to showcase your products and services.",
    base_price_text: "Starting at $89/250",
    image_url:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["50", "100", "250", "500", "1000"],
          required: true,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: ['8.5" x 11" Tri-Fold', '11" x 17" Bi-Fold'],
          required: true,
        },
        {
          name: "paper_type",
          label: "Paper Type",
          type: "select",
          options: ["100lb Gloss", "100lb Matte", "80lb Text"],
          required: true,
        },
        {
          name: "sides",
          label: "Sides",
          type: "select",
          options: ["Single Sided", "Double Sided"],
          required: true,
        },
      ],
    },
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
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["1", "5", "10", "25", "50", "100"],
          required: true,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: ['18" x 24"', '24" x 36"', '11" x 17"'],
          required: true,
        },
        {
          name: "paper_type",
          label: "Paper Type",
          type: "select",
          options: ["Glossy", "Matte", "Satin"],
          required: true,
        },
      ],
    },
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
    options_schema: quantityPrint(["250", "500", "1000", "2500", "5000"]),
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
    options_schema: quantityPrint(["100", "250", "500", "1000", "2500"]),
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
    options_schema: quantityPrint(["50", "100", "250", "500"]),
  },
  {
    title: "Roll-Up Banners",
    slug: "roll-up-banners",
    category: "Print Materials",
    description: "Portable roll-up banners for trade shows, events, and retail displays.",
    base_price_text: "Starting at $89/banner",
    image_url:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["1", "2", "3", "5", "10"],
          required: true,
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          options: ['33" x 80"', '24" x 72"'],
          required: true,
        },
      ],
    },
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

  // DTF Printing
  {
    title: "DTF Transfers",
    slug: "dtf-transfers",
    category: "DTF Printing",
    description:
      "Direct-to-film transfers for vibrant, durable prints on any fabric color.",
    base_price_text: "Starting at $3/transfer",
    image_url:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["10", "25", "50", "100", "250", "500"],
          required: true,
        },
        {
          name: "transfer_size",
          label: "Transfer Size",
          type: "select",
          options: ['4" x 4"', '8" x 10"', '11" x 11"', "Custom"],
          required: true,
        },
      ],
    },
  },
  {
    title: "Custom Apparel Printing (DTF)",
    slug: "custom-apparel-printing-dtf",
    category: "DTF Printing",
    description: "Full custom apparel printing using DTF technology for any garment.",
    base_price_text: "Starting at $15/piece",
    image_url:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop",
    active: true,
    options_schema: {
      fields: [
        {
          name: "quantity",
          label: "Quantity",
          type: "select",
          options: ["1", "5", "10", "25", "50", "100"],
          required: true,
        },
        {
          name: "garment_type",
          label: "Garment Type",
          type: "text",
          placeholder: "e.g. T-shirt, Hoodie, Jacket",
          required: true,
        },
        {
          name: "print_location",
          label: "Print Location",
          type: "select",
          options: ["Front", "Back", "Front and Back", "Sleeve"],
          required: true,
        },
        {
          name: "size_breakdown",
          label: "Size Breakdown",
          type: "textarea",
          placeholder: "e.g. S:2, M:5, L:8",
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
  "dtf-transfers",
  "graphic-design-services",
  "roll-up-banners",
];
