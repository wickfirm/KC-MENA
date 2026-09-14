export type AboutContent = {
  version: 1;
  hero: { heading: string; image: { src: string; alt: string } };
  overview: {
    eyebrow: string; intro: string;
    metrics: Array<{ value: string; label: string }>;
    businessLines: Array<{ title: string; description: string }>;
    action: { label: string; href: string };
  };
  chairman: { eyebrow: string; quote: string; paragraphs: string[]; name: string; title: string; image: { src: string; alt: string } };
  visionMission: Array<{ eyebrow: string; quote: string; attribution: string }>;
  principles: Array<{ eyebrow: string; title: string; body: string }>;
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  version: 1,
  hero: { heading: "About Us", image: { src: "/images/reference/about-hero.webp", alt: "Kasumigaseki MENA" } },
  overview: {
    eyebrow: "Company Overview",
    intro: "Kasumigaseki MENA is the regional subsidiary of Kasumigaseki Capital, headquartered in Tokyo, focused on Development, Investment & Asset Management, and Food & Beverage opportunities currently operating within the GCC.",
    metrics: [{ value: "3 Sectors", label: "Business Sector" }, { value: "3+", label: "Projects" }, { value: "60", label: "Assets / Units" }, { value: "90", label: "Number of Employees" }],
    businessLines: [
      { title: "Development", description: "Development work that connects land strategy, product creation, project execution, and go-to-market planning." },
      { title: "Investment & Asset Management", description: "Investment sourcing, underwriting, acquisition support, fund strategy, and asset management for regional opportunities." },
      { title: "Food & Beverage", description: "Dining concepts shaped around Japanese craft, premium sourcing, operational detail, and destination-led guest experience." },
    ],
    action: { label: "Know more", href: "/local-business/" },
  },
  chairman: {
    eyebrow: "Message from the Chairman",
    quote: "Our direction is clear: build enduring partnerships in the UAE and wider GCC, combine Japanese discipline with local insight, and hold every project to standards that last.",
    paragraphs: ["Kasumigaseki MENA's future will be built on disciplined investment, rigorous execution, and a deep respect for the markets we serve. The UAE has shown itself to be a long-term platform for global capital, and our role is to translate that opportunity into projects and partnerships that endure.", "As we move forward, our focus remains excellence in design, governance, delivery, and asset stewardship. We will continue to align with the philosophy of Kasumigaseki Capital while building a regional platform shaped by local knowledge, patient capital, and sustainable value creation."],
    name: "Mohammad Khalifa Majid Alabbar Alfalasi",
    title: "Chairman, Kasumigaseki Capital MENA",
    image: { src: "/images/chairman-mohammad-alabbar.jpg", alt: "Mohammad Khalifa Majid Alabbar Alfalasi, Chairman of Kasumigaseki Capital MENA" },
  },
  visionMission: [{ eyebrow: "Our Vision", quote: "To be the most trusted regional platform for turning ambition into lasting value.", attribution: "Kasumigaseki MENA" }, { eyebrow: "Our Mission", quote: "We are driven by a singular mission: to shape a future where economic growth and social impact go hand in hand.", attribution: "Tatsuya Suzuki, CEO" }],
  principles: [{ eyebrow: "Our Philosophy", title: "Guided by Kasumigaseki Capital", body: "Our company follows the philosophy, values, and operational guidelines established by our mother company. We are committed to upholding these principles in every aspect of our business while maintaining the highest standards of integrity, quality, and sustainability." }, { eyebrow: "Guiding Principle", title: "Be Bold, Reliable and Swift", body: "The standard we hold ourselves to in every decision, partnership, and delivery: decisive, accountable, and always aligned with long-term value creation." }],
};

export function isAboutContent(value: unknown): value is AboutContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const content = value as Partial<AboutContent>;
  return content.version === 1 && !!content.hero && typeof content.hero.heading === "string" && !!content.overview && Array.isArray(content.overview.metrics) && Array.isArray(content.overview.businessLines) && !!content.chairman && Array.isArray(content.chairman.paragraphs) && Array.isArray(content.visionMission) && Array.isArray(content.principles);
}
