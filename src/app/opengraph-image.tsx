import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Kasumigaseki MENA: development, investment and operations across the GCC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Site-wide social card for pages without artwork of their own (news posts use their cover image). */
export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "images", "logo kme dark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", padding: "80px", fontFamily: "serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={651 * 1.1} height={147 * 1.1} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ width: 96, height: 6, background: "#a6192e" }} />
          <div style={{ fontSize: 54, lineHeight: 1.15, color: "#0a0a0a" }}>Development, Investment &amp; Asset Management, and Food &amp; Beverage across the GCC</div>
          <div style={{ fontSize: 28, color: "#555555", fontFamily: "sans-serif" }}>kasumigaseki.ae</div>
        </div>
      </div>
    ),
    size
  );
}
