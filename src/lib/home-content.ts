import type { ModuleDocument } from "@/lib/content-modules";

/** Default content mirrors the supplied Home HTML until the client publishes CMS content. */
export const DEFAULT_HOME_CONTENT: ModuleDocument = {
  version: 1,
  template: "home",
  modules: [
    {
      id: "hero",
      type: "hero",
      heading: "Turning Challenge into Value.",
      body: "A regional development, investment, and operating platform across the GCC and beyond.",
      image: { src: "/images/quality2.webp", alt: "Kasumigaseki MENA" },
      videoSrc: "/media/Website-Video-Hero.mp4",
    },
    {
      id: "about",
      type: "rich-text",
      eyebrow: "About Kasumigaseki",
      body: "Kasumigaseki MENA is the regional subsidiary of Kasumigaseki Capital, headquartered in Tokyo, established to extend the group's development, investment, and operating capabilities across the GCC.",
    },
    {
      id: "group-metrics",
      type: "metrics",
      items: [
        { value: "$5.17B", label: "Global AUM¹" },
        { value: "$2.33B", label: "Logistics Assets Under Management" },
        { value: "$190M", label: "Overseas / Other" },
        { value: "$2.30B", label: "Hotels" },
        { value: "$280M", label: "Healthcare" },
      ],
    },
    {
      id: "local-businesses",
      type: "feature-grid",
      eyebrow: "What we do",
      heading: "Local businesses, built for the GCC.",
      body: "A focused platform across Development, Investment & Asset Management, and Food & Beverage — each guided by the same standard of precision and long-term thinking.",
      items: [
        { title: "Development", body: "Connecting land strategy, product creation, capital structuring, and sales execution across regional development opportunities.", image: { src: "/images/11.jpg", alt: "Development" }, link: { label: "Learn more", href: "/real-estate-development/" } },
        { title: "Investment & Asset Management", body: "Disciplined capital deployment and long-term stewardship, guided by the governance standards of a listed platform.", image: { src: "/images/real estate assets.webp", alt: "Investment and asset management" }, link: { label: "Learn more", href: "/real-estate/" } },
        { title: "Food & Beverage", body: "Operating businesses built for daily relevance — where hospitality discipline meets regional taste and community life.", image: { src: "/images/f&b.webp", alt: "Food and beverage" }, link: { label: "Learn more", href: "/f-and-b/" } },
      ],
    },
    {
      id: "locations",
      type: "location-grid",
      eyebrow: "Where we operate",
      heading: "A growing global platform.",
      body: "Regional capability in Dubai, backed by the global scale and governance of our Tokyo headquarters — with an expanding presence across new markets.",
      locations: [
        { label: "Regional HQ", city: "Dubai, UAE", address: "Dubai Hills Estate, Business Park 4, Office 304-305", image: { src: "/images/location-dubai.webp", alt: "Dubai skyline and Burj Khalifa" }, mapLink: { label: "View on map", href: "https://www.google.com/maps/search/?api=1&query=Dubai+Hills+Estate+Business+Park+4", external: true } },
        { label: "Global HQ", city: "Tokyo, Japan", address: "3-2-1 Kasumigaseki, Chiyoda City, Tokyo 100-0013", image: { src: "/images/location-tokyo.webp", alt: "Mount Fuji and Chureito Pagoda in Japan" }, mapLink: { label: "View on map", href: "https://www.google.com/maps/search/?api=1&query=3-2-1+Kasumigaseki+Chiyoda+Tokyo", external: true } },
        { label: "Regional Office", city: "Kuala Lumpur, Malaysia", address: "Unit 60.03, Level 60, Exchange 106, TRX", image: { src: "/images/location-kuala-lumpur.webp", alt: "Kuala Lumpur skyline with the Petronas Twin Towers" }, mapLink: { label: "View on map", href: "https://www.google.com/maps/search/?api=1&query=Exchange+106+TRX+Kuala+Lumpur", external: true } },
        { label: "Americas", city: "Miami, USA", address: "Our gateway to opportunities across the Americas.", image: { src: "/images/location-miami.webp", alt: "Miami waterfront skyline" }, mapLink: { label: "View on map", href: "https://www.google.com/maps/search/?api=1&query=Miami+Florida", external: true } },
      ],
    },
    {
      id: "global-businesses",
      type: "feature-grid",
      eyebrow: "Global businesses",
      heading: "Beyond the region, Kasumigaseki Capital operates established platforms worldwide.",
      items: [
        { title: "Logistics", body: "Cold-chain facilities, flexible storage, and build-to-suit development across the network.", image: { src: "/images/logistics_home.webp", alt: "Logistics" }, tags: ["LOGI FLAG", "COLD X NETWORK"] },
        { title: "Hospitality", body: "Trend, technology, finance, and design connected across group-stay, luxury, and culture-led brands.", image: { src: "/images/hotel business.webp", alt: "Hospitality" }, tags: ["seven x seven", "FAV / FAV LUX"] },
        { title: "Healthcare", body: "Open-hospice and welfare facilities pairing 24/365 medical readiness with daily-life dignity.", image: { src: "/images/healthcare-stack-1.webp", alt: "Healthcare" }, tags: ["CLASWELL", "24/365 Care"] },
      ],
    },
    {
      id: "contact",
      type: "call-to-action",
      eyebrow: "Register your interest",
      heading: "Tell us what you're looking for.",
      body: "Share a few details and the right person from our team will be in touch — typically within one business day.",
      action: { label: "Contact us", href: "/contact-us/" },
    },
  ],
};
