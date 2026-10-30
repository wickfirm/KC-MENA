"use client";

import type { TypeRole, TypeScale, TypeStyle } from "@/lib/type-style";
import { TYPE_ROLE_LABELS, TYPE_ROLES } from "@/lib/type-style";
import { labelStyle } from "./editor-styles";

function styleOf(scale: TypeScale | undefined, role: TypeRole): TypeStyle {
  return scale?.[role] ?? {};
}

export default function TypeFields({
  prefix,
  value,
  legend = "Type",
}: {
  prefix: string;
  value?: TypeScale;
  legend?: string;
}) {
  return (
    <fieldset style={{ border: "1px solid var(--line)", padding: 14, marginTop: 8 }}>
      <legend style={{ ...labelStyle, padding: "0 6px" }}>{legend}</legend>
      <p style={{ color: "var(--grey-5)", fontSize: ".8rem", marginBottom: 12 }}>Leave a control on “Same as above” to keep the site or page setting. No colour controls.</p>
      {TYPE_ROLES.map((role) => {
        const style = styleOf(value, role);
        return (
          <div key={role} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 1fr auto", gap: 10, alignItems: "end", marginBottom: 10 }}>
            <strong style={{ fontSize: ".82rem" }}>{TYPE_ROLE_LABELS[role]}</strong>
            <label style={labelStyle}>Font
              <select name={`${prefix}-${role}-font`} defaultValue={style.font ?? ""}>
                <option value="">Same as above</option>
                <option value="figtree">Figtree</option>
                <option value="serif">Noto Serif</option>
              </select>
            </label>
            <label style={labelStyle}>Size
              <select name={`${prefix}-${role}-size`} defaultValue={style.size ?? ""}>
                <option value="">Same as above</option>
                <option value="s">Small</option>
                <option value="m">Medium</option>
                <option value="l">Large</option>
                <option value="xl">Extra large</option>
              </select>
            </label>
            <label style={labelStyle}>Weight
              <select name={`${prefix}-${role}-weight`} defaultValue={style.weight ?? ""}>
                <option value="">Same as above</option>
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </label>
            <label style={labelStyle}>Style
              <select name={`${prefix}-${role}-italic`} defaultValue={style.italic === true ? "italic" : style.italic === false ? "normal" : ""}>
                <option value="">Same as above</option>
                <option value="normal">Regular</option>
                <option value="italic">Italic</option>
              </select>
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}

export function readTypeScale(value: (name: string) => string, prefix: string): TypeScale {
  const scale: TypeScale = {};
  for (const role of TYPE_ROLES) {
    const italic = value(`${prefix}-${role}-italic`);
    const style: TypeStyle = {
      font: (value(`${prefix}-${role}-font`) || "") as TypeStyle["font"],
      size: (value(`${prefix}-${role}-size`) || "") as TypeStyle["size"],
      weight: (value(`${prefix}-${role}-weight`) || "") as TypeStyle["weight"],
    };
    if (italic === "italic") style.italic = true;
    if (italic === "normal") style.italic = false;
    if (style.font || style.size || style.weight || style.italic !== undefined) scale[role] = style;
  }
  return scale;
}
