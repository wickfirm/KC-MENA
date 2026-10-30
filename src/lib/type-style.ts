import type { CSSProperties } from "react";

/** Blank means "use the level above". Site, then page, then section. */
export type TypeStyle = {
  font?: "" | "figtree" | "serif";
  size?: "" | "s" | "m" | "l" | "xl";
  weight?: "" | "300" | "400" | "500" | "600" | "700";
  italic?: boolean;
};

export type TypeRole = "title" | "heading" | "body" | "eyebrow" | "button";

export type TypeScale = Partial<Record<TypeRole, TypeStyle>>;

export const TYPE_ROLES: TypeRole[] = ["title", "heading", "body", "eyebrow", "button"];

export const TYPE_ROLE_LABELS: Record<TypeRole, string> = {
  title: "Page title",
  heading: "Section heading",
  body: "Body text",
  eyebrow: "Small label",
  button: "Button",
};

const SIZE: Record<NonNullable<TypeStyle["size"]>, string> = {
  "": "",
  s: "0.85rem",
  m: "1rem",
  l: "1.35rem",
  xl: "clamp(1.8rem, 3.4vw, 2.8rem)",
};

const FONT: Record<NonNullable<TypeStyle["font"]>, string> = {
  "": "",
  figtree: "'Figtree', sans-serif",
  serif: "'Noto Serif', serif",
};

export function mergeType(site?: TypeStyle, page?: TypeStyle, section?: TypeStyle): TypeStyle {
  return {
    font: section?.font || page?.font || site?.font || "",
    size: section?.size || page?.size || site?.size || "",
    weight: section?.weight || page?.weight || site?.weight || "",
    italic: section?.italic ?? page?.italic ?? site?.italic,
  };
}

/** Inline style for one role. Only the properties the client set are included. */
export function typeStyle(site?: TypeScale, page?: TypeScale, section?: TypeScale, role: TypeRole = "body"): CSSProperties | undefined {
  const chosen = mergeType(site?.[role], page?.[role], section?.[role]);
  const style: CSSProperties = {};
  if (chosen.font) style.fontFamily = FONT[chosen.font];
  if (chosen.size) style.fontSize = SIZE[chosen.size];
  if (chosen.weight) style.fontWeight = Number(chosen.weight);
  if (chosen.italic === true) style.fontStyle = "italic";
  if (chosen.italic === false) style.fontStyle = "normal";
  return Object.keys(style).length ? style : undefined;
}

const ROLE_SELECTOR: Record<TypeRole, string> = {
  title: "h1",
  heading: ":is(h2, h3, h4)",
  body: ":is(p, li, blockquote)",
  eyebrow: ".eyebrow",
  button: ":is(.btn, a.go, a.loc-maplink, .stat-know-more, button)",
};

/** CSS for one level. Only properties the client actually set are emitted, so the original design stays otherwise. */
export function typeRules(scale: TypeScale | undefined, scope: string): string {
  if (!scale) return "";
  const blocks: string[] = [];
  for (const role of TYPE_ROLES) {
    const chosen = scale[role];
    if (!chosen) continue;
    const declarations: string[] = [];
    if (chosen.font) declarations.push(`font-family:${FONT[chosen.font]} !important`);
    if (chosen.size) declarations.push(`font-size:${SIZE[chosen.size]} !important`);
    if (chosen.weight) declarations.push(`font-weight:${chosen.weight} !important`);
    if (chosen.italic === true) declarations.push("font-style:italic !important");
    if (chosen.italic === false) declarations.push("font-style:normal !important");
    if (declarations.length) blocks.push(`${scope} ${ROLE_SELECTOR[role]}{${declarations.join(";")}}`);
  }
  return blocks.join("\n");
}

export function isTypeScale(value: unknown): value is TypeScale {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return TYPE_ROLES.every((role) => {
    const style = (value as TypeScale)[role];
    return style === undefined || (typeof style === "object" && style !== null);
  });
}
