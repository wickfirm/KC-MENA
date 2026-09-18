export const BUSINESS_DETAIL_SLUGS = [
  "real-estate-development",
  "real-estate",
  "f-and-b",
  "global-businesses",
] as const;

export type BusinessDetailSlug = (typeof BUSINESS_DETAIL_SLUGS)[number];

export type BusinessDetailContent = {
  version: 1;
  hero: { title: string; image: string };
  overview: { eyebrow: string; heading: string };
  metrics?: Array<{ value: string; label: string }>;
  metricsSource?: { label: string; href: string };
  callouts?: Array<{ eyebrow: string; heading: string; body: string; href: string; label: string }>;
  sections: Array<{
    eyebrow: string;
    heading: string;
    body: string;
    image: string;
    action?: { label: string; href: string; external?: boolean };
  }>;
};

const details: Record<BusinessDetailSlug, BusinessDetailContent> = {
  "real-estate-development": {
    version: 1,
    hero: { title: "Development", image: "/images/reference/real-estate-development-hero.webp" },
    overview: {
      eyebrow: "By The Numbers",
      heading: "A development business that connects land strategy, product creation, capital structuring, and sales execution across Dubai and the wider GCC.",
    },
    metrics: [{ value: "14,000", label: "Sales Experience Center (sq ft)" }, { value: "20–30", label: "Staff Capacity" }, { value: "452,389", label: "Built-Up Area (sq ft)" }, { value: "203,575", label: "Gross Sellable Area (GSA, sq ft)" }],
    metricsSource: { label: "As of February 28, 2026", href: "https://kasumigaseki.co.jp/en/ir/" },
    sections: [
      { eyebrow: "Development Strategy", heading: "Development starts with strategy, but commercialization has to be built in from day one.", body: "Kasumigaseki's model starts by creating value before vertical construction begins: sourcing land, refining the product, shaping the planning strategy, and setting the capital roadmap early. That is how margins are protected before the market starts pricing the project.", image: "/images/Reception kpd.webp", action: { label: "Discuss development", href: "/contact-us/" } },
      { eyebrow: "Development Process", heading: "The model moves from land value to development, launch, and stabilized exit with a clear capital roadmap.", body: "The GCC model expands into project-specific SPEs and JVs, including cooperation with Daito Trust Construction, so Kasumigaseki can control product quality, sales, and execution deeper into the cycle.", image: "/images/sales center b2.webp" },
      { eyebrow: "Meydan Horizon", heading: "Sales execution and customer experience are built into the development model.", body: "Meydan Horizon is the first branded residential development, planned as a landmark mixed-use project with 452,389 sq ft of built-up area on a 28,273 sq ft plot and 203,575 sq ft of gross sellable area. The Business Bay sales center adds a dedicated launch layer with 14,000 sq ft of client, meeting, cafe, and backend workspace for 20 to 30 staff.", image: "/images/reference/real-estate-development-hero.webp", action: { label: "Contact the team", href: "/contact-us/" } },
    ],
  },
  "real-estate": {
    version: 1,
    hero: { title: "Investment & Asset Management", image: "/images/reference/real-estate-hero.webp" },
    overview: { eyebrow: "By The Numbers", heading: "A regional investment and asset management business built around disciplined underwriting, selective market access, and long-term value creation." },
    metrics: [{ value: "4", label: "Key Dubai Districts" }, { value: "$156.5M", label: "Active Assets" }, { value: "60", label: "Investment Exposure" }, { value: "26 + 3", label: "Units + Plots" }],
    sections: [
      { eyebrow: "Investment & Asset Management", heading: "This is not a listings business. It is an investment business.", body: "Kasumigaseki MENA identifies inefficiencies in product, location, pricing, and timing. The current Dubai portfolio spans high-performing districts including Downtown, Dubai Hills, Hartland, and Palm Jumeirah.", image: "/images/stower-furnished.webp", action: { label: "Investment enquiries", href: "/contact-us/" } },
      { eyebrow: "Why Dubai, Why Now", heading: "The thesis is built on growth, liquidity, and international relevance.", body: "The long-term market case is supported by continued population growth, infrastructure expansion, Dubai's 2040 urban master plan, and globally mobile investors seeking security, connectivity, and a tax-efficient base.", image: "/images/imperial avenue view.webp" },
      { eyebrow: "Platform Role", heading: "The proposition is built around access, discipline, and market logic.", body: "The business supports more than acquisition: it covers sourcing, underwriting, financial modeling, transaction support, asset strategy after closing, repositioning, leasing logic, resale preparation, and development planning.", image: "/images/reference/real-estate-highlight.webp", action: { label: "Contact the team", href: "/contact-us/" } },
    ],
  },
  "f-and-b": {
    version: 1,
    hero: { title: "Food & Beverage", image: "/images/reference/fnb-hero.webp" },
    overview: { eyebrow: "Business Snapshot", heading: "A Tokyo-rooted dining concept in Dubai built around Neo-Japanese cuisine, charcoal fire, premium ingredients from Japan, and hospitality designed to leave a mark." },
    metrics: [{ value: "Vida", label: "Emirates Hills" }, { value: "Neo", label: "Japanese Cuisine" }, { value: "Charcoal", label: "Fire-Led Menu" }, { value: "Keigo Abe", label: "Chef-Led Concept" }],
    sections: [
      { eyebrow: "Food & Beverage", heading: "Authentic Japanese dining, translated for Dubai without diluting the craft.", body: "Kasumigaseki Restaurant is positioned as a Japanese dining experience brought from Tokyo to a global audience. The concept blends disciplined technique with a contemporary expression, giving Dubai a restaurant that feels both premium and current.", image: "/images/f&b.webp", action: { label: "Vida Emirates Hills", href: "https://maps.app.goo.gl/i2oFuHW3icgJj1378?g_st=ac", external: true } },
      { eyebrow: "Chef & Menu", heading: "The kitchen is led by chef Keigo Abe.", body: "With Michelin-selected recognition in Tokyo, the menu moves across seasonal ingredients, charcoal-fired dishes, omakase-inspired moments, and plates designed for both discovery and repeat visits.", image: "/images/reference/fnb-highlight.webp", action: { label: "F&B enquiries", href: "/contact-us/" } },
      { eyebrow: "Dubai Positioning", heading: "The concept wins because food, room, and service are all aligned.", body: "The Food & Beverage business is built around craft, atmosphere, and memorability: credible technique, luxury without noise, and a setting designed for destination dining and repeat business.", image: "/images/reference/fnb-hero.webp", action: { label: "Contact the team", href: "/contact-us/" } },
    ],
  },
  "global-businesses": {
    version: 1,
    hero: { title: "Global Business", image: "/images/logistics_home.webp" },
    overview: { eyebrow: "Our global businesses", heading: "Creating value through a disciplined global platform." },
    metrics: [
      { value: "$5.17B", label: "Total Project Value & AUM" },
      { value: "129", label: "Projects in Pipeline & Under Management" },
    ],
    callouts: [
      { eyebrow: "Where We Operate", heading: "Explore our global business map.", body: "View Kasumigaseki Capital's business locations and project network through the interactive map.", href: "https://www.kasumigaseki.co.jp/en/", label: "Explore the global platform" },
      { eyebrow: "Investors & Media", heading: "Investor Relations.", body: "For financial disclosures, IR presentations, and the latest news from Kasumigaseki Capital, visit our parent company's official Investor Relations page.", href: "https://www.kasumigaseki.co.jp/en/ir/", label: "Visit Investor Relations" },
    ],
    sections: [
      { eyebrow: "Logistics", heading: "Cold, dry, and automated — built as one network.", body: "LOGI FLAG and COLD X NETWORK combine dry, chilled, frozen, and automated supply-chain infrastructure across Japan.", image: "/images/logistics.webp" },
      { eyebrow: "Hotel Business", heading: "Five brands, one hospitality platform.", body: "FAV Hospitality Group spans seven x seven, edit x seven, FAV, BASE LAYER HOTEL, and HOTEL FORK & KNIFE.", image: "/images/hotel business.webp" },
      { eyebrow: "Healthcare", heading: "Medically ready environments, built around dignity.", body: "KC Welfare and the CLASWELL model develop medically ready environments with resident dignity at the center.", image: "/images/healthcare-stack-1.webp" },
    ],
  },
};

export const DEFAULT_BUSINESS_DETAILS = details;

export function isBusinessDetailSlug(value: string): value is BusinessDetailSlug {
  return BUSINESS_DETAIL_SLUGS.includes(value as BusinessDetailSlug);
}

export function isBusinessDetailContent(value: unknown): value is BusinessDetailContent {
  const content = value as Partial<BusinessDetailContent> | null;
  return Boolean(
    content &&
      content.version === 1 &&
      typeof content.hero?.title === "string" &&
      typeof content.hero?.image === "string" &&
      typeof content.overview?.eyebrow === "string" &&
      typeof content.overview?.heading === "string" &&
      (content.metrics === undefined || (Array.isArray(content.metrics) && content.metrics.every((metric) => typeof metric?.value === "string" && typeof metric?.label === "string"))) &&
      (content.callouts === undefined || (Array.isArray(content.callouts) && content.callouts.every((callout) => typeof callout?.eyebrow === "string" && typeof callout?.heading === "string" && typeof callout?.body === "string" && typeof callout?.href === "string" && typeof callout?.label === "string"))) &&
      Array.isArray(content.sections) &&
      content.sections.length > 0 &&
      content.sections.every((section) =>
        typeof section?.eyebrow === "string" &&
        typeof section?.heading === "string" &&
        typeof section?.body === "string" &&
        typeof section?.image === "string"
      )
  );
}
