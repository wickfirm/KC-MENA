/**
 * The public-site content contract.
 *
 * JSONB is deliberately retained for flexible page composition, but every
 * document is constrained to a page template and a small set of known
 * modules. The admin UI should render form controls for these definitions;
 * it must not expose this document as a raw JSON editor.
 */

export type LinkField = {
  label: string;
  href: string;
  external?: boolean;
};

export type ImageField = {
  src: string;
  alt: string;
};

export type ContentModule =
  | {
      id: string;
      type: "hero";
      kicker?: string;
      heading: string;
      body?: string;
      image?: ImageField;
      videoSrc?: string;
    }
  | {
      id: string;
      type: "rich-text";
      eyebrow?: string;
      heading?: string;
      body: string;
    }
  | {
      id: string;
      type: "metrics";
      eyebrow?: string;
      heading?: string;
      items: Array<{ value: string; label: string; note?: string }>;
    }
  | {
      id: string;
      type: "feature-grid";
      eyebrow?: string;
      heading: string;
      body?: string;
      items: Array<{
        title: string;
        body?: string;
        image?: ImageField;
        link?: LinkField;
        tags?: string[];
      }>;
    }
  | {
      id: string;
      type: "location-grid";
      eyebrow?: string;
      heading: string;
      body?: string;
      locations: Array<{
        label: string;
        city: string;
        address: string;
        image: ImageField;
        mapLink?: LinkField;
      }>;
    }
  | {
      id: string;
      type: "call-to-action";
      eyebrow?: string;
      heading: string;
      body?: string;
      action: LinkField;
    };

export type ModuleType = ContentModule["type"];

export type ModuleDocument = {
  version: 1;
  template: TemplateKey;
  modules: ContentModule[];
};

export type TemplateKey =
  | "home"
  | "about"
  | "business-overview"
  | "business-detail"
  | "news-index"
  | "legal";

export type TemplateDefinition = {
  label: string;
  allowed: readonly ModuleType[];
  required: readonly ModuleType[];
};

export const PAGE_TEMPLATES: Record<TemplateKey, TemplateDefinition> = {
  home: {
    label: "Home",
    allowed: ["hero", "rich-text", "metrics", "feature-grid", "location-grid", "call-to-action"],
    required: ["hero", "feature-grid", "call-to-action"],
  },
  about: {
    label: "About",
    allowed: ["hero", "rich-text", "metrics", "feature-grid", "call-to-action"],
    required: ["hero", "rich-text", "call-to-action"],
  },
  "business-overview": {
    label: "Business overview",
    allowed: ["hero", "rich-text", "feature-grid", "call-to-action"],
    required: ["hero", "feature-grid", "call-to-action"],
  },
  "business-detail": {
    label: "Business detail",
    allowed: ["hero", "rich-text", "metrics", "feature-grid", "call-to-action"],
    required: ["hero", "rich-text", "call-to-action"],
  },
  "news-index": {
    label: "News index",
    allowed: ["hero", "rich-text", "feature-grid", "call-to-action"],
    required: ["hero"],
  },
  legal: {
    label: "Legal",
    allowed: ["rich-text"],
    required: ["rich-text"],
  },
};

export type ModuleDocumentIssue = {
  path: string;
  message: string;
};

/** Lightweight server-side guard used by page APIs before writing JSONB. */
export function validateModuleDocument(value: unknown): ModuleDocumentIssue[] {
  if (!isRecord(value)) return [{ path: "content", message: "Content must be an object." }];
  if (value.version !== 1) return [{ path: "content.version", message: "Unsupported content version." }];
  if (!isTemplateKey(value.template)) return [{ path: "content.template", message: "Unknown page template." }];
  if (!Array.isArray(value.modules)) return [{ path: "content.modules", message: "Modules must be a list." }];

  const definition = PAGE_TEMPLATES[value.template];
  const issues: ModuleDocumentIssue[] = [];
  const seen = new Set<string>();
  const moduleTypes = new Set<ModuleType>();

  value.modules.forEach((module, index) => {
    const path = `content.modules[${index}]`;
    if (!isRecord(module) || typeof module.id !== "string" || !module.id.trim()) {
      issues.push({ path, message: "Every module needs an id." });
      return;
    }
    if (seen.has(module.id)) issues.push({ path: `${path}.id`, message: "Module ids must be unique." });
    seen.add(module.id);
    if (!isModuleType(module.type) || !definition.allowed.includes(module.type)) {
      issues.push({ path: `${path}.type`, message: "This module is not allowed on the selected template." });
      return;
    }
    moduleTypes.add(module.type);
    if (["hero", "feature-grid", "location-grid", "call-to-action"].includes(module.type) && typeof module.heading !== "string") {
      issues.push({ path: `${path}.heading`, message: "A heading is required." });
    }
  });

  definition.required.forEach((type) => {
    if (!moduleTypes.has(type)) issues.push({ path: "content.modules", message: `The ${type} module is required for ${definition.label}.` });
  });

  return issues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isModuleType(value: unknown): value is ModuleType {
  return typeof value === "string" && ["hero", "rich-text", "metrics", "feature-grid", "location-grid", "call-to-action"].includes(value);
}

function isTemplateKey(value: unknown): value is TemplateKey {
  return typeof value === "string" && value in PAGE_TEMPLATES;
}
