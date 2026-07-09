export type OptionValue = {
  id: string;
  label: string;
  description?: string;
  priceMultiplier?: number;
  priceDelta?: number;
};

export type OptionGroup = {
  id: string;
  label: string;
  values: OptionValue[];
};

export type QuantityTier = {
  qty: number;
  unitPrice: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  tagline: string;
  description: string;
  image: string;
  basePrice: number;
  rating: number;
  reviews: number;
  tags: string[];
  popular?: boolean;
  turnaroundDays: number;
  features: string[];
  options: OptionGroup[];
  quantityTiers: QuantityTier[];
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
  icon: string;
};

export const categories: Category[] = [
  {
    slug: "boxes-packaging",
    name: "Boxes & Packaging",
    description: "Custom mailer boxes, product boxes, and retail packaging.",
    image: "/products/kraft-mailer-box.png",
    icon: "package",
  },
  {
    slug: "pouches-flexible",
    name: "Pouches & Flexible Packaging",
    description: "Stand-up pouches, coffee bags, and resealable packaging.",
    image: "/products/stand-up-pouch.png",
    icon: "package-open",
  },
  {
    slug: "labels-stickers",
    name: "Labels & Stickers",
    description: "Product labels, roll labels, and die-cut stickers.",
    image: "/products/product-labels.png",
    icon: "sticker",
  },
  {
    slug: "business-cards",
    name: "Business Cards",
    description: "Premium finishes that make the right first impression.",
    image: "/products/business-cards.png",
    icon: "credit-card",
  },
  {
    slug: "stationery",
    name: "Stationery & Office",
    description: "Letterheads, envelopes, notepads, and desk calendars.",
    image: "/products/custom-letterhead.png",
    icon: "file-pen",
  },
  {
    slug: "flyers-leaflets",
    name: "Flyers & Leaflets",
    description: "High-impact marketing flyers and leaflets.",
    image: "/products/flyers.png",
    icon: "file-text",
  },
  {
    slug: "booklets-catalogs",
    name: "Booklets & Catalogs",
    description: "Multi-page booklets, catalogs, and brochures.",
    image: "/products/booklets.png",
    icon: "book-open",
  },
  {
    slug: "large-format",
    name: "Banners & Large Format",
    description: "Roll-up banners, backdrops, and outdoor signage.",
    image: "/products/roll-up-banner.png",
    icon: "flag",
  },
  {
    slug: "signage-displays",
    name: "Signage & Displays",
    description: "Foam boards, wall decals, and stand-mounted displays.",
    image: "/products/foam-board-sign.png",
    icon: "signpost",
  },
  {
    slug: "branded-merch",
    name: "Branded Merch",
    description: "Custom apparel, mugs, and promotional items.",
    image: "/products/branded-tote.png",
    icon: "shirt",
  },
];

const sizeOptions = (
  labels: {
    id: string;
    label: string;
    description?: string;
    priceMultiplier?: number;
  }[],
): OptionGroup => ({
  id: "size",
  label: "Size",
  values: labels,
});

const materialOptions: OptionGroup = {
  id: "material",
  label: "Material",
  values: [
    { id: "standard", label: "Standard", priceMultiplier: 1 },
    {
      id: "premium",
      label: "Premium",
      description: "Heavier stock",
      priceMultiplier: 1.25,
    },
    {
      id: "recycled",
      label: "Recycled Kraft",
      description: "Eco-friendly",
      priceMultiplier: 1.15,
    },
  ],
};

const finishOptions: OptionGroup = {
  id: "finish",
  label: "Finish",
  values: [
    { id: "matte", label: "Matte", priceMultiplier: 1 },
    { id: "gloss", label: "Gloss", priceMultiplier: 1.05 },
    {
      id: "spot-uv",
      label: "Spot UV",
      description: "Premium accent",
      priceMultiplier: 1.35,
    },
    {
      id: "foil",
      label: "Gold Foil",
      description: "Luxury finish",
      priceMultiplier: 1.6,
    },
  ],
};

const sidesOptions: OptionGroup = {
  id: "sides",
  label: "Sides",
  values: [
    { id: "single", label: "Single-sided", priceMultiplier: 1 },
    { id: "double", label: "Double-sided", priceMultiplier: 1.2 },
  ],
};

export const products: Product[] = [
  // ---------------- Boxes & Packaging ----------------
  {
    id: "kraft-mailer-box",
    slug: "kraft-mailer-box",
    name: "Custom Kraft Mailer Box",
    categorySlug: "boxes-packaging",
    tagline: "Durable e-commerce shipping boxes with your brand.",
    description:
      "Premium corrugated mailer boxes printed with your artwork. Perfect for e-commerce unboxing experiences, subscription boxes, and retail. Fully customizable inside and out.",
    image: "/products/kraft-mailer-box.png",
    basePrice: 850,
    rating: 4.8,
    reviews: 214,
    tags: ["E-commerce", "Corrugated", "Eco-friendly"],
    popular: true,
    turnaroundDays: 7,
    features: [
      "Food-grade safe inks",
      "Recyclable materials",
      "Custom sizing",
      "Interior printing available",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small (20x15x8cm)", priceMultiplier: 1 },
        { id: "medium", label: "Medium (30x22x10cm)", priceMultiplier: 1.4 },
        { id: "large", label: "Large (40x30x15cm)", priceMultiplier: 1.9 },
      ]),
      materialOptions,
      finishOptions,
    ],
    quantityTiers: [
      { qty: 50, unitPrice: 850 },
      { qty: 100, unitPrice: 720 },
      { qty: 250, unitPrice: 610 },
      { qty: 500, unitPrice: 520 },
      { qty: 1000, unitPrice: 450 },
    ],
  },
  {
    id: "rigid-product-box",
    slug: "rigid-product-box",
    name: "Luxury Rigid Product Box",
    categorySlug: "boxes-packaging",
    tagline: "High-end rigid boxes for premium products.",
    description:
      "Sturdy rigid gift boxes with a luxury feel. Ideal for cosmetics, electronics, and premium retail. Choose magnetic closure and custom inserts for a memorable presentation.",
    image: "/products/rigid-product-box.png",
    basePrice: 1650,
    rating: 4.9,
    reviews: 98,
    tags: ["Luxury", "Rigid", "Retail"],
    turnaroundDays: 10,
    features: [
      "Magnetic closure option",
      "Custom foam inserts",
      "Soft-touch lamination",
      "Premium unboxing",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small", priceMultiplier: 1 },
        { id: "medium", label: "Medium", priceMultiplier: 1.5 },
        { id: "large", label: "Large", priceMultiplier: 2.1 },
      ]),
      materialOptions,
      finishOptions,
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 1650 },
      { qty: 50, unitPrice: 1420 },
      { qty: 100, unitPrice: 1180 },
      { qty: 250, unitPrice: 980 },
    ],
  },
  {
    id: "corrugated-shipping-box",
    slug: "corrugated-shipping-box",
    name: "Corrugated Shipping Box",
    categorySlug: "boxes-packaging",
    tagline: "Heavy-duty boxes built for transit.",
    description:
      "Double-walled corrugated boxes designed to survive the journey, not just look good on a shelf. Available plain or printed with your logo on one or more panels.",
    image: "/products/corrugated-shipping-box.png",
    basePrice: 520,
    rating: 4.6,
    reviews: 76,
    tags: ["Heavy-duty", "Logistics", "Bulk"],
    turnaroundDays: 6,
    features: [
      "Double-wall option",
      "Stackable design",
      "1 to 4 color printing",
      "Bulk pricing",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small (25x20x15cm)", priceMultiplier: 1 },
        { id: "medium", label: "Medium (35x28x20cm)", priceMultiplier: 1.35 },
        { id: "large", label: "Large (50x40x30cm)", priceMultiplier: 1.85 },
      ]),
      materialOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 520 },
      { qty: 250, unitPrice: 430 },
      { qty: 500, unitPrice: 360 },
      { qty: 1000, unitPrice: 300 },
    ],
  },
  {
    id: "shoe-box",
    slug: "shoe-box",
    name: "Custom Shoe Box",
    categorySlug: "boxes-packaging",
    tagline: "Branded footwear packaging with a lid.",
    description:
      "Two-piece base-and-lid shoe boxes printed with your branding inside and out. A go-to for footwear and apparel brands who want retail-shelf presentation.",
    image: "/products/shoe-box.png",
    basePrice: 780,
    rating: 4.7,
    reviews: 61,
    tags: ["Footwear", "Two-piece", "Retail-ready"],
    turnaroundDays: 9,
    features: [
      "Base and lid construction",
      "Full wrap printing",
      "Ventilation holes optional",
      "Stackable",
    ],
    options: [
      sizeOptions([
        { id: "sneaker", label: "Sneaker (33x20x12cm)", priceMultiplier: 1 },
        { id: "boot", label: "Boot (35x22x18cm)", priceMultiplier: 1.3 },
      ]),
      materialOptions,
      finishOptions,
    ],
    quantityTiers: [
      { qty: 50, unitPrice: 780 },
      { qty: 100, unitPrice: 650 },
      { qty: 250, unitPrice: 540 },
      { qty: 500, unitPrice: 460 },
    ],
  },
  {
    id: "cosmetic-carton",
    slug: "cosmetic-carton",
    name: "Cosmetic Folding Carton",
    categorySlug: "boxes-packaging",
    tagline: "Compact printed cartons for skincare and beauty.",
    description:
      "Lightweight folding cartons sized for bottles, jars, and tubes. Full-color printing with matte, gloss, or soft-touch finishes for a shelf-ready look.",
    image: "/products/cosmetic-carton.png",
    basePrice: 310,
    rating: 4.8,
    reviews: 133,
    tags: ["Beauty", "Folding carton", "Shelf-ready"],
    popular: true,
    turnaroundDays: 6,
    features: [
      "Precision die-cut windows",
      "Food & cosmetic safe inks",
      "Tuck-end or auto-lock base",
      "Small minimums",
    ],
    options: [
      sizeOptions([
        { id: "bottle", label: "Bottle (5x5x15cm)", priceMultiplier: 1 },
        { id: "jar", label: "Jar (8x8x8cm)", priceMultiplier: 0.9 },
        { id: "tube", label: "Tube (4x4x18cm)", priceMultiplier: 0.95 },
      ]),
      finishOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 310 },
      { qty: 250, unitPrice: 250 },
      { qty: 500, unitPrice: 200 },
      { qty: 1000, unitPrice: 165 },
    ],
  },

  // ---------------- Pouches & Flexible Packaging ----------------
  {
    id: "stand-up-pouch",
    slug: "stand-up-pouch",
    name: "Stand-Up Pouch",
    categorySlug: "pouches-flexible",
    tagline: "Self-standing resealable pouches for retail.",
    description:
      "Flexible stand-up pouches with a resealable zip lock, printed in full color. Ideal for snacks, powders, granules, and other retail-ready dry goods.",
    image: "/products/stand-up-pouch.png",
    basePrice: 145,
    rating: 4.7,
    reviews: 94,
    tags: ["Resealable", "Retail", "Food-grade"],
    popular: true,
    turnaroundDays: 8,
    features: [
      "Resealable zip lock",
      "Food-safe barrier film",
      "Matte or gloss finish",
      "Optional clear window",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small (100g)", priceMultiplier: 1 },
        { id: "medium", label: "Medium (250g)", priceMultiplier: 1.25 },
        { id: "large", label: "Large (500g)", priceMultiplier: 1.6 },
      ]),
      {
        id: "window",
        label: "Window",
        values: [
          { id: "none", label: "No window", priceMultiplier: 1 },
          { id: "clear", label: "Clear window", priceMultiplier: 1.15 },
        ],
      },
      finishOptions,
    ],
    quantityTiers: [
      { qty: 250, unitPrice: 145 },
      { qty: 500, unitPrice: 118 },
      { qty: 1000, unitPrice: 95 },
      { qty: 2500, unitPrice: 78 },
    ],
  },
  {
    id: "coffee-bag-pouch",
    slug: "coffee-bag-pouch",
    name: "Coffee Bag Pouch",
    categorySlug: "pouches-flexible",
    tagline: "Aroma-locking bags with a one-way valve.",
    description:
      "Flat-bottom or side-gusset coffee bags with a degassing valve to keep beans fresh. Printed full-color with your roast's branding front and back.",
    image: "/products/coffee-bag-pouch.png",
    basePrice: 210,
    rating: 4.8,
    reviews: 58,
    tags: ["One-way valve", "Aroma barrier", "Flat-bottom"],
    turnaroundDays: 9,
    features: [
      "One-way degassing valve",
      "Foil-lined barrier film",
      "Resealable zip",
      "Flat-bottom or side-gusset",
    ],
    options: [
      sizeOptions([
        { id: "250g", label: "250g bag", priceMultiplier: 1 },
        { id: "500g", label: "500g bag", priceMultiplier: 1.3 },
        { id: "1kg", label: "1kg bag", priceMultiplier: 1.7 },
      ]),
      finishOptions,
    ],
    quantityTiers: [
      { qty: 250, unitPrice: 210 },
      { qty: 500, unitPrice: 175 },
      { qty: 1000, unitPrice: 140 },
    ],
  },
  {
    id: "ziplock-pouch",
    slug: "ziplock-pouch",
    name: "Clear Ziplock Pouch",
    categorySlug: "pouches-flexible",
    tagline: "Simple printed pouches for small goods.",
    description:
      "Lightweight clear or printed ziplock pouches for jewelry, small parts, samples, and merch add-ons. Budget-friendly and quick to turn around.",
    image: "/products/ziplock-pouch.png",
    basePrice: 35,
    rating: 4.5,
    reviews: 47,
    tags: ["Budget", "Clear film", "Fast turnaround"],
    turnaroundDays: 4,
    features: [
      "Clear or frosted film",
      "Ziplock reseal",
      "1-color logo print available",
      "Small minimums",
    ],
    options: [
      sizeOptions([
        { id: "xs", label: "XS (6x9cm)", priceMultiplier: 1 },
        { id: "s", label: "S (10x15cm)", priceMultiplier: 1.2 },
        { id: "m", label: "M (15x20cm)", priceMultiplier: 1.45 },
      ]),
    ],
    quantityTiers: [
      { qty: 200, unitPrice: 35 },
      { qty: 500, unitPrice: 28 },
      { qty: 1000, unitPrice: 22 },
      { qty: 2500, unitPrice: 17 },
    ],
  },

  // ---------------- Labels & Stickers ----------------
  {
    id: "product-labels",
    slug: "product-labels",
    name: "Custom Product Labels",
    categorySlug: "labels-stickers",
    tagline: "Waterproof roll labels for bottles and jars.",
    description:
      "Vibrant, waterproof product labels on premium adhesive stock. Perfect for beverages, cosmetics, and food packaging. Available in custom shapes and sizes.",
    image: "/products/product-labels.png",
    basePrice: 120,
    rating: 4.7,
    reviews: 342,
    tags: ["Waterproof", "Roll labels", "Food-safe"],
    popular: true,
    turnaroundDays: 5,
    features: [
      "Waterproof adhesive",
      "Custom die-cut shapes",
      "Oil & tear resistant",
      "Roll or sheet format",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small (5x5cm)", priceMultiplier: 1 },
        { id: "medium", label: "Medium (8x10cm)", priceMultiplier: 1.3 },
        { id: "large", label: "Large (10x15cm)", priceMultiplier: 1.7 },
      ]),
      {
        id: "shape",
        label: "Shape",
        values: [
          { id: "rectangle", label: "Rectangle", priceMultiplier: 1 },
          { id: "circle", label: "Circle", priceMultiplier: 1.05 },
          { id: "custom", label: "Custom Die-Cut", priceMultiplier: 1.25 },
        ],
      },
      finishOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 120 },
      { qty: 250, unitPrice: 95 },
      { qty: 500, unitPrice: 72 },
      { qty: 1000, unitPrice: 55 },
      { qty: 2500, unitPrice: 42 },
    ],
  },
  {
    id: "die-cut-stickers",
    slug: "die-cut-stickers",
    name: "Die-Cut Stickers",
    categorySlug: "labels-stickers",
    tagline: "Custom-shaped vinyl stickers that pop.",
    description:
      "Durable vinyl die-cut stickers cut to any shape. Great for branding, packaging seals, laptops, and giveaways. Weatherproof and fade-resistant.",
    image: "/products/die-cut-stickers.png",
    basePrice: 90,
    rating: 4.8,
    reviews: 187,
    turnaroundDays: 4,
    tags: ["Vinyl", "Weatherproof", "Custom shape"],
    features: [
      "Weatherproof vinyl",
      "Any custom shape",
      "Vibrant color",
      "Easy peel backing",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small (5cm)", priceMultiplier: 1 },
        { id: "medium", label: "Medium (8cm)", priceMultiplier: 1.35 },
        { id: "large", label: "Large (12cm)", priceMultiplier: 1.8 },
      ]),
      finishOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 90 },
      { qty: 250, unitPrice: 68 },
      { qty: 500, unitPrice: 52 },
      { qty: 1000, unitPrice: 40 },
    ],
  },
  {
    id: "sticker-sheet",
    slug: "sticker-sheet",
    name: "Custom Sticker Sheets",
    categorySlug: "labels-stickers",
    tagline: "Multiple stickers on one kiss-cut sheet.",
    description:
      "Kiss-cut sticker sheets featuring multiple designs per sheet. Great for brand kits, packaging inserts, and collectible sets. Easy to peel individual stickers.",
    image: "/products/sticker-sheet.png",
    basePrice: 150,
    rating: 4.7,
    reviews: 112,
    turnaroundDays: 5,
    tags: ["Kiss-cut", "Multi-design", "A6/A5"],
    features: [
      "Multiple designs per sheet",
      "Kiss-cut for easy peel",
      "Matte or gloss",
      "Premium adhesive",
    ],
    options: [
      sizeOptions([
        { id: "a6", label: "A6 Sheet", priceMultiplier: 1 },
        { id: "a5", label: "A5 Sheet", priceMultiplier: 1.4 },
        { id: "a4", label: "A4 Sheet", priceMultiplier: 2 },
      ]),
      finishOptions,
    ],
    quantityTiers: [
      { qty: 50, unitPrice: 150 },
      { qty: 100, unitPrice: 120 },
      { qty: 250, unitPrice: 90 },
      { qty: 500, unitPrice: 70 },
    ],
  },
  {
    id: "barcode-labels",
    slug: "barcode-labels",
    name: "Barcode & Pricing Labels",
    categorySlug: "labels-stickers",
    tagline: "Scannable labels for retail and inventory.",
    description:
      "Thermal-compatible barcode and pricing labels for retail shelves and inventory management. Sequential numbering and variable data printing available.",
    image: "/products/barcode-labels.png",
    basePrice: 40,
    rating: 4.6,
    reviews: 88,
    tags: ["Thermal", "Sequential", "Retail"],
    turnaroundDays: 4,
    features: [
      "Thermal or adhesive stock",
      "Sequential barcode numbering",
      "Variable data printing",
      "Roll format",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small (3x2cm)", priceMultiplier: 1 },
        { id: "medium", label: "Medium (5x3cm)", priceMultiplier: 1.2 },
      ]),
    ],
    quantityTiers: [
      { qty: 500, unitPrice: 40 },
      { qty: 1000, unitPrice: 30 },
      { qty: 2500, unitPrice: 22 },
      { qty: 5000, unitPrice: 16 },
    ],
  },
  {
    id: "wine-bottle-labels",
    slug: "wine-bottle-labels",
    name: "Wine & Spirits Labels",
    categorySlug: "labels-stickers",
    tagline: "Elegant labels for bottled beverages.",
    description:
      "Textured, moisture-resistant labels built for ice buckets and condensation. Foil and embossing available for a premium bottle presentation.",
    image: "/products/wine-bottle-labels.png",
    basePrice: 165,
    rating: 4.9,
    reviews: 41,
    tags: ["Moisture-resistant", "Textured stock", "Foil available"],
    turnaroundDays: 7,
    features: [
      "Moisture and ice-resistant",
      "Textured cotton stock option",
      "Foil and emboss finishes",
      "Front and back label sets",
    ],
    options: [
      sizeOptions([
        { id: "standard", label: "Standard bottle", priceMultiplier: 1 },
        { id: "magnum", label: "Magnum bottle", priceMultiplier: 1.3 },
      ]),
      finishOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 165 },
      { qty: 250, unitPrice: 135 },
      { qty: 500, unitPrice: 110 },
    ],
  },

  // ---------------- Business Cards ----------------
  {
    id: "premium-business-cards",
    slug: "premium-business-cards",
    name: "Premium Business Cards",
    categorySlug: "business-cards",
    tagline: "Make a lasting first impression.",
    description:
      "Thick, premium business cards with luxury finishes. Choose from matte, gloss, spot UV, and gold foil to create a card that reflects your brand's quality.",
    image: "/products/business-cards.png",
    basePrice: 45,
    rating: 4.9,
    reviews: 512,
    popular: true,
    turnaroundDays: 3,
    tags: ["400gsm", "Premium finishes", "Double-sided"],
    features: [
      "400gsm thick stock",
      "Double-sided printing",
      "Rounded corner option",
      "Foil & spot UV",
    ],
    options: [
      sidesOptions,
      {
        id: "corners",
        label: "Corners",
        values: [
          { id: "square", label: "Square", priceMultiplier: 1 },
          { id: "rounded", label: "Rounded", priceMultiplier: 1.1 },
        ],
      },
      finishOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 45 },
      { qty: 250, unitPrice: 34 },
      { qty: 500, unitPrice: 26 },
      { qty: 1000, unitPrice: 19 },
    ],
  },
  {
    id: "metal-business-cards",
    slug: "metal-business-cards",
    name: "Metal Business Cards",
    categorySlug: "business-cards",
    tagline: "Brushed metal cards for a standout handoff.",
    description:
      "Etched or printed stainless steel business cards. A distinctive option for executives, agencies, and anyone who wants their card remembered.",
    image: "/products/metal-business-cards.png",
    basePrice: 480,
    rating: 4.9,
    reviews: 27,
    tags: ["Stainless steel", "Etched", "Executive"],
    turnaroundDays: 12,
    features: [
      "Brushed stainless steel",
      "Laser-etched detail",
      "Optional color fill",
      "Protective pouch included",
    ],
    options: [
      {
        id: "finish",
        label: "Finish",
        values: [
          { id: "silver", label: "Brushed Silver", priceMultiplier: 1 },
          { id: "black", label: "Black Matte", priceMultiplier: 1.15 },
          { id: "gold", label: "Gold Plated", priceMultiplier: 1.5 },
        ],
      },
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 480 },
      { qty: 50, unitPrice: 420 },
      { qty: 100, unitPrice: 370 },
    ],
  },
  {
    id: "foil-stamped-business-cards",
    slug: "foil-stamped-business-cards",
    name: "Foil-Stamped Business Cards",
    categorySlug: "business-cards",
    tagline: "Cotton stock with a raised foil finish.",
    description:
      "Soft cotton cardstock finished with raised foil stamping in gold, silver, rose gold, or copper. A tactile, editorial-feeling card for design-led brands.",
    image: "/products/foil-stamped-business-cards.png",
    basePrice: 95,
    rating: 4.9,
    reviews: 63,
    tags: ["Cotton stock", "Raised foil", "Design-led"],
    turnaroundDays: 6,
    features: [
      "100% cotton cardstock",
      "Raised foil stamping",
      "Letterpress texture",
      "Deckle edge option",
    ],
    options: [
      {
        id: "foil-color",
        label: "Foil Color",
        values: [
          { id: "gold", label: "Gold", priceMultiplier: 1 },
          { id: "silver", label: "Silver", priceMultiplier: 1 },
          { id: "rose-gold", label: "Rose Gold", priceMultiplier: 1.1 },
          { id: "copper", label: "Copper", priceMultiplier: 1.1 },
        ],
      },
      sidesOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 95 },
      { qty: 250, unitPrice: 78 },
      { qty: 500, unitPrice: 62 },
    ],
  },

  // ---------------- Stationery & Office ----------------
  {
    id: "custom-letterhead",
    slug: "custom-letterhead",
    name: "Custom Letterhead",
    categorySlug: "stationery",
    tagline: "Professional letterhead for official correspondence.",
    description:
      "Full-color letterhead printed on premium paper stock, sized to A4 or letter. A simple, essential piece of stationery that keeps your correspondence on-brand.",
    image: "/products/custom-letterhead.png",
    basePrice: 55,
    rating: 4.7,
    reviews: 39,
    tags: ["A4", "Corporate", "Premium paper"],
    turnaroundDays: 4,
    features: [
      "A4 or Letter sizing",
      "Premium uncoated paper",
      "Single or full-color print",
      "Watermark option",
    ],
    options: [
      sizeOptions([
        { id: "a4", label: "A4", priceMultiplier: 1 },
        { id: "letter", label: "US Letter", priceMultiplier: 1.05 },
      ]),
      materialOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 55 },
      { qty: 250, unitPrice: 42 },
      { qty: 500, unitPrice: 33 },
      { qty: 1000, unitPrice: 26 },
    ],
  },
  {
    id: "branded-envelope",
    slug: "branded-envelope",
    name: "Branded Envelopes",
    categorySlug: "stationery",
    tagline: "Printed envelopes to match your letterhead.",
    description:
      "Custom-printed envelopes in DL, A5, and A4 sizes, with your logo and return address printed in place. Pairs with letterheads and invoices for a consistent set.",
    image: "/products/branded-envelope.png",
    basePrice: 48,
    rating: 4.6,
    reviews: 28,
    tags: ["DL/A5/A4", "Self-seal", "Corporate"],
    turnaroundDays: 5,
    features: [
      "Self-seal or gummed flap",
      "Window or non-window",
      "Matches letterhead branding",
      "Bulk pricing",
    ],
    options: [
      sizeOptions([
        { id: "dl", label: "DL", priceMultiplier: 1 },
        { id: "a5", label: "A5", priceMultiplier: 1.2 },
        { id: "a4", label: "A4", priceMultiplier: 1.5 },
      ]),
      {
        id: "window",
        label: "Window",
        values: [
          { id: "none", label: "No window", priceMultiplier: 1 },
          { id: "window", label: "With window", priceMultiplier: 1.1 },
        ],
      },
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 48 },
      { qty: 250, unitPrice: 38 },
      { qty: 500, unitPrice: 30 },
      { qty: 1000, unitPrice: 24 },
    ],
  },
  {
    id: "custom-notepad",
    slug: "custom-notepad",
    name: "Branded Notepads",
    categorySlug: "stationery",
    tagline: "Glued-edge notepads for desks and giveaways.",
    description:
      "Custom notepads with your branding on every sheet, glue-bound on one edge. Useful as an internal office supply or a low-cost branded giveaway.",
    image: "/products/custom-notepad.png",
    basePrice: 210,
    rating: 4.6,
    reviews: 34,
    tags: ["Glue-bound", "Office", "Giveaway"],
    turnaroundDays: 6,
    features: [
      "50 sheets per pad",
      "Glued top or side edge",
      "Chipboard backing",
      "1 or full-color printing",
    ],
    options: [
      sizeOptions([
        { id: "a6", label: "A6", priceMultiplier: 1 },
        { id: "a5", label: "A5", priceMultiplier: 1.3 },
      ]),
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 210 },
      { qty: 50, unitPrice: 175 },
      { qty: 100, unitPrice: 145 },
    ],
  },
  {
    id: "desk-calendar",
    slug: "desk-calendar",
    name: "Branded Desk Calendar",
    categorySlug: "stationery",
    tagline: "A year-round branded gift for clients.",
    description:
      "Spiral-bound or tent-fold desk calendars printed with your branding and dates. A popular year-end corporate gift that keeps your logo on a desk all year.",
    image: "/products/desk-calendar.png",
    basePrice: 640,
    rating: 4.7,
    reviews: 22,
    tags: ["Corporate gift", "Spiral-bound", "Seasonal"],
    turnaroundDays: 10,
    features: [
      "Spiral or tent-fold binding",
      "12-month layout",
      "Custom cover branding",
      "Thick board backing",
    ],
    options: [
      {
        id: "binding",
        label: "Binding",
        values: [
          { id: "spiral", label: "Spiral-bound", priceMultiplier: 1 },
          { id: "tent", label: "Tent-fold", priceMultiplier: 0.85 },
        ],
      },
      materialOptions,
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 640 },
      { qty: 50, unitPrice: 540 },
      { qty: 100, unitPrice: 460 },
    ],
  },

  // ---------------- Flyers & Leaflets ----------------
  {
    id: "marketing-flyers",
    slug: "marketing-flyers",
    name: "Marketing Flyers",
    categorySlug: "flyers-leaflets",
    tagline: "High-impact flyers for promotions and events.",
    description:
      "Full-color flyers printed on premium paper. Perfect for events, product launches, and promotions. Available in A4, A5, and DL sizes.",
    image: "/products/flyers.png",
    basePrice: 60,
    rating: 4.6,
    reviews: 276,
    turnaroundDays: 4,
    tags: ["Full-color", "A4/A5/DL", "Fast turnaround"],
    features: [
      "Vibrant full-color print",
      "Multiple size options",
      "Single or double-sided",
      "Premium paper stock",
    ],
    options: [
      sizeOptions([
        { id: "dl", label: "DL (99x210mm)", priceMultiplier: 0.85 },
        { id: "a5", label: "A5 (148x210mm)", priceMultiplier: 1 },
        { id: "a4", label: "A4 (210x297mm)", priceMultiplier: 1.6 },
      ]),
      sidesOptions,
      materialOptions,
    ],
    quantityTiers: [
      { qty: 100, unitPrice: 60 },
      { qty: 250, unitPrice: 44 },
      { qty: 500, unitPrice: 32 },
      { qty: 1000, unitPrice: 24 },
      { qty: 2500, unitPrice: 18 },
    ],
  },
  {
    id: "presentation-folder",
    slug: "presentation-folder",
    name: "Presentation Folders",
    categorySlug: "flyers-leaflets",
    tagline: "Professional branded document folders.",
    description:
      "Premium presentation folders with business card slots and document pockets. Perfect for corporate proposals, onboarding kits, and sales materials.",
    image: "/products/presentation-folder.png",
    basePrice: 320,
    rating: 4.6,
    reviews: 74,
    turnaroundDays: 6,
    tags: ["Corporate", "Card slot", "Premium"],
    features: [
      "Business card slots",
      "Document pockets",
      "Premium coated stock",
      "Custom die-cut",
    ],
    options: [materialOptions, finishOptions],
    quantityTiers: [
      { qty: 50, unitPrice: 320 },
      { qty: 100, unitPrice: 260 },
      { qty: 250, unitPrice: 210 },
      { qty: 500, unitPrice: 170 },
    ],
  },
  {
    id: "door-hangers",
    slug: "door-hangers",
    name: "Door Hangers",
    categorySlug: "flyers-leaflets",
    tagline: "Direct-to-door marketing that gets noticed.",
    description:
      "Die-cut door hangers with a slot to hang on a doorknob. A proven format for local promotions, real estate, and service businesses canvassing a neighborhood.",
    image: "/products/door-hangers.png",
    basePrice: 75,
    rating: 4.5,
    reviews: 33,
    tags: ["Die-cut", "Local marketing", "Double-sided"],
    turnaroundDays: 5,
    features: [
      "Die-cut doorknob slot",
      "Perforated tear-off tab option",
      "Double-sided printing",
      "Weather-resistant stock",
    ],
    options: [sidesOptions, materialOptions],
    quantityTiers: [
      { qty: 250, unitPrice: 75 },
      { qty: 500, unitPrice: 58 },
      { qty: 1000, unitPrice: 44 },
      { qty: 2500, unitPrice: 34 },
    ],
  },
  {
    id: "rack-cards",
    slug: "rack-cards",
    name: "Rack Cards",
    categorySlug: "flyers-leaflets",
    tagline: "Tall, slim cards built for display racks.",
    description:
      "4x9 inch rack cards designed to sit in hotel lobbies, tourism racks, and reception counters. A compact way to promote an event, menu, or service.",
    image: "/products/rack-cards.png",
    basePrice: 55,
    rating: 4.6,
    reviews: 29,
    tags: ["4x9in", "Display rack", "Tourism & hospitality"],
    turnaroundDays: 4,
    features: [
      "Standard rack size",
      "Double-sided printing",
      "Gloss or matte finish",
      "Bulk pricing",
    ],
    options: [sidesOptions, finishOptions],
    quantityTiers: [
      { qty: 100, unitPrice: 55 },
      { qty: 250, unitPrice: 42 },
      { qty: 500, unitPrice: 32 },
      { qty: 1000, unitPrice: 25 },
    ],
  },

  // ---------------- Booklets & Catalogs ----------------
  {
    id: "company-booklets",
    slug: "company-booklets",
    name: "Company Booklets",
    categorySlug: "booklets-catalogs",
    tagline: "Professional multi-page booklets and catalogs.",
    description:
      "Saddle-stitched or perfect-bound booklets for catalogs, reports, and brochures. Showcase your products and services with a polished, professional finish.",
    image: "/products/booklets.png",
    basePrice: 480,
    rating: 4.8,
    reviews: 129,
    turnaroundDays: 8,
    tags: ["Saddle-stitched", "Full-color", "Custom pages"],
    features: [
      "8 to 48 page options",
      "Saddle-stitch or perfect bound",
      "Premium cover stock",
      "Full-color throughout",
    ],
    options: [
      {
        id: "pages",
        label: "Pages",
        values: [
          { id: "8", label: "8 pages", priceMultiplier: 1 },
          { id: "16", label: "16 pages", priceMultiplier: 1.6 },
          { id: "24", label: "24 pages", priceMultiplier: 2.2 },
          { id: "32", label: "32 pages", priceMultiplier: 2.8 },
        ],
      },
      {
        id: "binding",
        label: "Binding",
        values: [
          { id: "saddle", label: "Saddle Stitch", priceMultiplier: 1 },
          { id: "perfect", label: "Perfect Bound", priceMultiplier: 1.3 },
        ],
      },
      materialOptions,
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 480 },
      { qty: 50, unitPrice: 390 },
      { qty: 100, unitPrice: 310 },
      { qty: 250, unitPrice: 250 },
    ],
  },
  {
    id: "product-catalog",
    slug: "product-catalog",
    name: "Product Catalog",
    categorySlug: "booklets-catalogs",
    tagline: "Full-line catalogs for sales teams and showrooms.",
    description:
      "Larger-format, higher page-count catalogs built for showcasing an entire product line. Perfect cast for trade shows, showrooms, and wholesale buyers.",
    image: "/products/product-catalog.png",
    basePrice: 720,
    rating: 4.7,
    reviews: 45,
    tags: ["Trade show", "Perfect bound", "48+ pages"],
    turnaroundDays: 12,
    features: [
      "Up to 96 pages",
      "Perfect bound with spine print",
      "Matte laminated cover",
      "Index and section tabs",
    ],
    options: [
      {
        id: "pages",
        label: "Pages",
        values: [
          { id: "48", label: "48 pages", priceMultiplier: 1 },
          { id: "64", label: "64 pages", priceMultiplier: 1.35 },
          { id: "96", label: "96 pages", priceMultiplier: 1.9 },
        ],
      },
      finishOptions,
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 720 },
      { qty: 50, unitPrice: 610 },
      { qty: 100, unitPrice: 520 },
    ],
  },
  {
    id: "menu-booklets",
    slug: "menu-booklets",
    name: "Restaurant Menus",
    categorySlug: "booklets-catalogs",
    tagline: "Durable, wipeable menus for daily service.",
    description:
      "Laminated or heavyweight menu booklets built to handle daily handling, spills, and wipe-downs. Single-page, tri-fold, and multi-page formats available.",
    image: "/products/menu-booklets.png",
    basePrice: 190,
    rating: 4.7,
    reviews: 52,
    tags: ["Laminated", "Wipeable", "Hospitality"],
    turnaroundDays: 6,
    features: [
      "Laminated wipeable surface",
      "Tri-fold or booklet formats",
      "Heavyweight cover stock",
      "Custom cutouts for QR menus",
    ],
    options: [
      {
        id: "format",
        label: "Format",
        values: [
          { id: "trifold", label: "Tri-fold", priceMultiplier: 1 },
          { id: "booklet", label: "Booklet (8pp)", priceMultiplier: 1.6 },
        ],
      },
      finishOptions,
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 190 },
      { qty: 50, unitPrice: 155 },
      { qty: 100, unitPrice: 125 },
    ],
  },

  // ---------------- Banners & Large Format ----------------
  {
    id: "roll-up-banner",
    slug: "roll-up-banner",
    name: "Roll-Up Banner",
    categorySlug: "large-format",
    tagline: "Portable pull-up banners for events.",
    description:
      "Professional retractable roll-up banners with a sturdy aluminum stand and carry bag. Perfect for exhibitions, conferences, and retail displays.",
    image: "/products/roll-up-banner.png",
    basePrice: 12500,
    rating: 4.7,
    reviews: 88,
    popular: true,
    turnaroundDays: 5,
    tags: ["Retractable", "Stand included", "Carry bag"],
    features: [
      "Aluminum stand included",
      "Carry bag included",
      "Anti-curl material",
      "Vibrant large-format print",
    ],
    options: [
      sizeOptions([
        { id: "standard", label: "Standard (85x200cm)", priceMultiplier: 1 },
        { id: "wide", label: "Wide (100x200cm)", priceMultiplier: 1.2 },
        { id: "premium", label: "Premium (120x200cm)", priceMultiplier: 1.5 },
      ]),
      materialOptions,
    ],
    quantityTiers: [
      { qty: 1, unitPrice: 12500 },
      { qty: 3, unitPrice: 11200 },
      { qty: 5, unitPrice: 9800 },
      { qty: 10, unitPrice: 8500 },
    ],
  },
  {
    id: "pvc-flex-banner",
    slug: "pvc-flex-banner",
    name: "PVC Flex Banner",
    categorySlug: "large-format",
    tagline: "Weatherproof banners for outdoor advertising.",
    description:
      "Heavy-duty PVC flex banners with reinforced grommets for outdoor use. Sized to order for shopfronts, construction sites, and street-level advertising.",
    image: "/products/pvc-flex-banner.png",
    basePrice: 3200,
    rating: 4.6,
    reviews: 54,
    tags: ["Weatherproof", "Grommets", "Custom size"],
    turnaroundDays: 5,
    features: [
      "Reinforced eyelet grommets",
      "UV-resistant ink",
      "Custom size cut to order",
      "Hemmed edges",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small (1x2m)", priceMultiplier: 1 },
        { id: "medium", label: "Medium (2x3m)", priceMultiplier: 2.4 },
        { id: "large", label: "Large (3x5m)", priceMultiplier: 4.8 },
      ]),
    ],
    quantityTiers: [
      { qty: 1, unitPrice: 3200 },
      { qty: 3, unitPrice: 2850 },
      { qty: 5, unitPrice: 2500 },
    ],
  },
  {
    id: "backdrop-banner",
    slug: "backdrop-banner",
    name: "Step & Repeat Backdrop",
    categorySlug: "large-format",
    tagline: "Photo-op backdrops for events and launches.",
    description:
      "Large tension-fabric or PVC backdrops printed with repeating logos, built for press walls, launches, and photo booths. Ships with a frame or hanging grommets.",
    image: "/products/backdrop-banner.png",
    basePrice: 9800,
    rating: 4.8,
    reviews: 31,
    tags: ["Press wall", "Tension fabric", "Event"],
    turnaroundDays: 8,
    features: [
      "Tension fabric or PVC",
      "Includes frame or grommets",
      "Wrinkle-resistant material",
      "Repeating logo layout",
    ],
    options: [
      sizeOptions([
        { id: "standard", label: "Standard (2.4x2.4m)", priceMultiplier: 1 },
        { id: "large", label: "Large (3x2.4m)", priceMultiplier: 1.3 },
      ]),
      {
        id: "material",
        label: "Material",
        values: [
          { id: "pvc", label: "PVC Banner", priceMultiplier: 1 },
          { id: "fabric", label: "Tension Fabric", priceMultiplier: 1.4 },
        ],
      },
    ],
    quantityTiers: [
      { qty: 1, unitPrice: 9800 },
      { qty: 2, unitPrice: 9200 },
      { qty: 5, unitPrice: 8400 },
    ],
  },

  // ---------------- Signage & Displays ----------------
  {
    id: "foam-board-sign",
    slug: "foam-board-sign",
    name: "Foam Board Sign",
    categorySlug: "signage-displays",
    tagline: "Lightweight rigid signs for indoor display.",
    description:
      "Full-color prints mounted on rigid foam board, ready to hang or lean. Common for retail point-of-sale, real estate, and directional signage.",
    image: "/products/foam-board-sign.png",
    basePrice: 1450,
    rating: 4.6,
    reviews: 42,
    tags: ["Rigid", "Indoor", "Point-of-sale"],
    turnaroundDays: 4,
    features: [
      "5mm or 10mm foam board",
      "Full-color UV print",
      "Custom cut shapes",
      "Easel back optional",
    ],
    options: [
      sizeOptions([
        { id: "a3", label: "A3", priceMultiplier: 1 },
        { id: "a2", label: "A2", priceMultiplier: 1.5 },
        { id: "a1", label: "A1", priceMultiplier: 2.2 },
      ]),
      {
        id: "thickness",
        label: "Board Thickness",
        values: [
          { id: "5mm", label: "5mm", priceMultiplier: 1 },
          { id: "10mm", label: "10mm", priceMultiplier: 1.2 },
        ],
      },
    ],
    quantityTiers: [
      { qty: 1, unitPrice: 1450 },
      { qty: 5, unitPrice: 1280 },
      { qty: 10, unitPrice: 1120 },
    ],
  },
  {
    id: "vinyl-wall-decal",
    slug: "vinyl-wall-decal",
    name: "Vinyl Wall Decal",
    categorySlug: "signage-displays",
    tagline: "Removable branding for walls and windows.",
    description:
      "Cut or printed vinyl decals for office walls, storefront windows, and vehicle branding. Removable adhesive that doesn't damage paint or glass.",
    image: "/products/vinyl-wall-decal.png",
    basePrice: 2200,
    rating: 4.7,
    reviews: 37,
    tags: ["Removable", "Wall & window", "Custom cut"],
    turnaroundDays: 6,
    features: [
      "Removable adhesive vinyl",
      "Custom cut to any shape",
      "Indoor or outdoor rated",
      "Application included on request",
    ],
    options: [
      sizeOptions([
        { id: "small", label: "Small (1x1m)", priceMultiplier: 1 },
        { id: "medium", label: "Medium (2x1.5m)", priceMultiplier: 1.8 },
        { id: "large", label: "Large (3x2m)", priceMultiplier: 3.1 },
      ]),
    ],
    quantityTiers: [
      { qty: 1, unitPrice: 2200 },
      { qty: 3, unitPrice: 1950 },
      { qty: 5, unitPrice: 1750 },
    ],
  },
  {
    id: "x-banner-stand",
    slug: "x-banner-stand",
    name: "X-Banner Stand",
    categorySlug: "signage-displays",
    tagline: "Budget-friendly display stand for events.",
    description:
      "Lightweight X-frame banner stands, ideal as a second or third display piece at a booth alongside a roll-up banner. Quick to assemble, easy to transport.",
    image: "/products/x-banner-stand.png",
    basePrice: 6800,
    rating: 4.5,
    reviews: 24,
    tags: ["Lightweight", "Quick-assemble", "Event"],
    turnaroundDays: 5,
    features: [
      "X-frame fiberglass stand",
      "Carry bag included",
      "Double-sided printing option",
      "Tool-free assembly",
    ],
    options: [
      sizeOptions([
        { id: "standard", label: "Standard (60x160cm)", priceMultiplier: 1 },
        { id: "large", label: "Large (80x180cm)", priceMultiplier: 1.3 },
      ]),
      sidesOptions,
    ],
    quantityTiers: [
      { qty: 1, unitPrice: 6800 },
      { qty: 3, unitPrice: 6200 },
      { qty: 5, unitPrice: 5600 },
    ],
  },

  // ---------------- Branded Merch ----------------
  {
    id: "branded-tote",
    slug: "branded-tote",
    name: "Branded Tote Bag",
    categorySlug: "branded-merch",
    tagline: "Eco-friendly canvas totes with your logo.",
    description:
      "Durable cotton canvas tote bags printed with your brand. Great for events, giveaways, retail, and corporate gifting. Sustainable and reusable.",
    image: "/products/branded-tote.png",
    basePrice: 950,
    rating: 4.8,
    reviews: 156,
    turnaroundDays: 9,
    tags: ["Cotton canvas", "Eco-friendly", "Reusable"],
    features: [
      "100% cotton canvas",
      "Reinforced handles",
      "Screen or DTG print",
      "Multiple color options",
    ],
    options: [
      {
        id: "color",
        label: "Bag Color",
        values: [
          { id: "natural", label: "Natural", priceMultiplier: 1 },
          { id: "black", label: "Black", priceMultiplier: 1.05 },
          { id: "navy", label: "Navy", priceMultiplier: 1.05 },
        ],
      },
      {
        id: "print",
        label: "Print Type",
        values: [
          { id: "screen", label: "Screen Print", priceMultiplier: 1 },
          { id: "dtg", label: "Full-color DTG", priceMultiplier: 1.3 },
        ],
      },
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 950 },
      { qty: 50, unitPrice: 820 },
      { qty: 100, unitPrice: 690 },
      { qty: 250, unitPrice: 560 },
    ],
  },
  {
    id: "custom-tshirt",
    slug: "custom-tshirt",
    name: "Custom Printed T-Shirt",
    categorySlug: "branded-merch",
    tagline: "Premium cotton tees with your design.",
    description:
      "Soft, premium cotton t-shirts printed with your artwork. Perfect for teams, events, merchandise, and uniforms. Available in a full range of sizes and colors.",
    image: "/products/custom-tshirt.png",
    basePrice: 1200,
    rating: 4.7,
    reviews: 203,
    turnaroundDays: 7,
    tags: ["Premium cotton", "DTG print", "All sizes"],
    features: [
      "Ring-spun cotton",
      "Full-color DTG",
      "Sizes S to 3XL",
      "Soft-hand print",
    ],
    options: [
      {
        id: "color",
        label: "Shirt Color",
        values: [
          { id: "white", label: "White", priceMultiplier: 1 },
          { id: "black", label: "Black", priceMultiplier: 1.05 },
          { id: "colored", label: "Colored", priceMultiplier: 1.1 },
        ],
      },
      {
        id: "print",
        label: "Print Area",
        values: [
          { id: "front", label: "Front only", priceMultiplier: 1 },
          { id: "front-back", label: "Front & Back", priceMultiplier: 1.3 },
        ],
      },
    ],
    quantityTiers: [
      { qty: 10, unitPrice: 1200 },
      { qty: 25, unitPrice: 1050 },
      { qty: 50, unitPrice: 890 },
      { qty: 100, unitPrice: 740 },
    ],
  },
  {
    id: "custom-mug",
    slug: "custom-mug",
    name: "Custom Printed Mug",
    categorySlug: "branded-merch",
    tagline: "Full-wrap ceramic mugs with your design.",
    description:
      "Ceramic mugs printed with a full-color, dishwasher-safe wrap. A dependable corporate gift and merch item that people actually keep using.",
    image: "/products/custom-mug.png",
    basePrice: 780,
    rating: 4.7,
    reviews: 91,
    tags: ["Ceramic", "Dishwasher-safe", "Corporate gift"],
    turnaroundDays: 6,
    features: [
      "11oz or 15oz ceramic",
      "Dishwasher and microwave safe",
      "Full-wrap sublimation print",
      "Gift box available",
    ],
    options: [
      sizeOptions([
        { id: "11oz", label: "11oz", priceMultiplier: 1 },
        { id: "15oz", label: "15oz", priceMultiplier: 1.2 },
      ]),
      {
        id: "color",
        label: "Mug Color",
        values: [
          { id: "white", label: "White", priceMultiplier: 1 },
          { id: "black", label: "Black interior", priceMultiplier: 1.1 },
        ],
      },
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 780 },
      { qty: 50, unitPrice: 670 },
      { qty: 100, unitPrice: 570 },
    ],
  },
  {
    id: "branded-cap",
    slug: "branded-cap",
    name: "Branded Cap",
    categorySlug: "branded-merch",
    tagline: "Embroidered caps for teams and events.",
    description:
      "Structured six-panel caps with your logo embroidered or printed on the front panel. Adjustable strap fits most sizes, popular for staff uniforms and giveaways.",
    image: "/products/branded-cap.png",
    basePrice: 1450,
    rating: 4.6,
    reviews: 48,
    tags: ["Embroidered", "Adjustable", "Team uniform"],
    turnaroundDays: 8,
    features: [
      "Six-panel structured fit",
      "Embroidered or printed logo",
      "Adjustable strap back",
      "Multiple color options",
    ],
    options: [
      {
        id: "color",
        label: "Cap Color",
        values: [
          { id: "black", label: "Black", priceMultiplier: 1 },
          { id: "navy", label: "Navy", priceMultiplier: 1 },
          { id: "khaki", label: "Khaki", priceMultiplier: 1 },
        ],
      },
      {
        id: "branding",
        label: "Branding Method",
        values: [
          { id: "embroidery", label: "Embroidery", priceMultiplier: 1.2 },
          { id: "print", label: "Print", priceMultiplier: 1 },
        ],
      },
    ],
    quantityTiers: [
      { qty: 25, unitPrice: 1450 },
      { qty: 50, unitPrice: 1250 },
      { qty: 100, unitPrice: 1080 },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.categorySlug === slug);
}

export function getPopularProducts(): Product[] {
  return products.filter((p) => p.popular);
}

/** Compute the estimated unit price given selected option ids and quantity. */
export function computePrice(
  product: Product,
  selected: Record<string, string>,
  qty: number,
): { unitPrice: number; total: number } {
  // pick the closest quantity tier at or below qty, fallback to first
  const sortedTiers = [...product.quantityTiers].sort((a, b) => a.qty - b.qty);
  let tier = sortedTiers[0];
  for (const t of sortedTiers) {
    if (qty >= t.qty) tier = t;
  }

  let unit = tier.unitPrice;
  for (const group of product.options) {
    const chosenId = selected[group.id];
    const value = group.values.find((v) => v.id === chosenId);
    if (value) {
      if (value.priceMultiplier) unit *= value.priceMultiplier;
      if (value.priceDelta) unit += value.priceDelta;
    }
  }
  unit = Math.round(unit);
  return { unitPrice: unit, total: unit * qty };
}
