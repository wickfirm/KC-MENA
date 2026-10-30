import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultLegalContent, parseLegacyLegalHtml, readLegalContent } from "./legal-content";

function source(slug: string) {
  const html = readFileSync(join(process.cwd(), "reference", slug, "index.html"), "utf8");
  const title = html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]?.trim() ?? slug;
  const meta = html.match(/<aside class="legal-meta">([\s\S]*?)<\/aside>/)?.[1] ?? "";
  const body = html.match(/<div class="legal-body">([\s\S]*?)\s*<\/div>\s*<\/div>\s*<\/section>/)?.[1] ?? "";
  return parseLegacyLegalHtml(meta, body, title);
}

describe("legal content", () => {
  it("keeps the space before an inline email link", () => {
    const privacy = defaultLegalContent("privacy-policy");
    const who = privacy.sections.find((section) => section.heading === "Who we are");
    const paragraph = who?.blocks.find((block) => block.type === "paragraph");
    expect(paragraph && paragraph.type === "paragraph" ? paragraph.runs.map((run) => run.text).join("") : "").toContain("contact info.dubai@kasumigaseki.co.jp.");
  });

  it("matches the client HTML section by section", () => {
    for (const slug of ["privacy-policy", "terms-and-conditions", "cookie-policy", "legal-notice"] as const) {
      const parsed = source(slug);
      const defaults = defaultLegalContent(slug);
      expect(parsed.sections.map((section) => section.heading)).toEqual(defaults.sections.map((section) => section.heading));
      expect(parsed.meta).toEqual(defaults.meta);
    }
  });

  it("converts delivered HTML into fields for the one-time CMS seed", () => {
    const content = parseLegacyLegalHtml(
      "<strong>Last updated</strong><br>August 10, 2026<br><br>Kasumigaseki Capital MENA<br>Dubai, United Arab Emirates",
      "<h2>Updates</h2><p>This policy may be updated.</p><p><button class=\"legal-consent-button\" type=\"button\" data-cookie-settings>Open Cookie Settings</button></p>",
      "Cookie Policy",
    );
    expect(content.sections[0]?.heading).toBe("Updates");
    expect(content.sections[0]?.blocks[1]).toEqual({ type: "button", label: "Open Cookie Settings" });
  });

  it("does not treat a stub or HTML row as CMS content", () => {
    expect(readLegalContent({ meta: "...", body: "..." })).toBeNull();
    expect(readLegalContent(defaultLegalContent("privacy-policy"))?.sections[0]?.heading).toBe("Overview");
  });
});
