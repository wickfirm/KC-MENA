export type ContactContent = {
  version: 1;
  heroTitle: string;
  heroImage?: string;
  enquiryEyebrow: string;
  enquiryHeading: string;
  enquiryBody: string;
  directionsLabel?: string;
  directPrompt?: string;
  submitLabel?: string;
  successMessage?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  subjectLabel?: string;
  messageLabel?: string;
  locations: Array<{ title: string; address: string; mapUrl?: string }>;
};
export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  version: 1,
  heroTitle: "Contact Us",
  heroImage: "/images/office.webp",
  enquiryEyebrow: "Enquiry Form",
  enquiryHeading: "Tell us what you need.",
  enquiryBody: "Complete the form and a member of our team will respond using the details you provide.",
  directionsLabel: "Get Directions ↗",
  directPrompt: "Prefer to reach us directly?",
  submitLabel: "Send Enquiry",
  successMessage: "Thank you — your enquiry has been received. Our team will be in touch shortly.",
  nameLabel: "Full Name",
  emailLabel: "Email",
  phoneLabel: "Phone Number",
  subjectLabel: "Subject",
  messageLabel: "Message",
  locations: [{ title: "Dubai Office", address: "Dubai Hills Estate\nBusiness Park 4, Office 304-305\nDubai, UAE", mapUrl: "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6" }, { title: "Sales Centre", address: "Business Bay\nDubai, UAE", mapUrl: "https://maps.app.goo.gl/xESmJtGHPZvotgkJ6" }, { title: "Miami Location", address: "Miami, Florida\nUnited States", mapUrl: "https://www.google.com/maps/search/?api=1&query=Miami+Florida" }, { title: "Kasumigaseki Restaurant", address: "Vida Emirates Hills\nDubai, UAE", mapUrl: "https://maps.app.goo.gl/i2oFuHW3icgJj1378?g_st=ac" }],
};
export function withContactDefaults(content: ContactContent): ContactContent {
  return {
    ...DEFAULT_CONTACT_CONTENT,
    ...content,
    locations: content.locations.map((location, index) => ({ ...DEFAULT_CONTACT_CONTENT.locations[index], ...location, mapUrl: location.mapUrl || DEFAULT_CONTACT_CONTENT.locations[index]?.mapUrl })),
  };
}
export function isContactContent(value: unknown): value is ContactContent { const content = value as Partial<ContactContent> | null; return Boolean(content && content.version === 1 && typeof content.heroTitle === "string" && typeof content.enquiryEyebrow === "string" && typeof content.enquiryHeading === "string" && typeof content.enquiryBody === "string" && Array.isArray(content.locations) && content.locations.every((location) => typeof location?.title === "string" && typeof location?.address === "string")); }
