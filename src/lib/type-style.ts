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

export function isTypeScale(value: unknown): value is TypeScale {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return TYPE_ROLES.every((role) => {
    const style = (value as TypeScale)[role];
    return style === undefined || (typeof style === "object" && style !== null);
  });
}
