// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, refresh: () => {} }), usePathname: () => "/admin" }));

import HomeEditor from "@/app/(admin)/admin/site/home/HomeEditor";
import BusinessDetailEditor from "@/app/(admin)/admin/site/business/[slug]/BusinessDetailEditor";
import ListingEditor from "@/app/(admin)/admin/site/listing/[slug]/ListingEditor";
import LocalBusinessEditor from "@/app/(admin)/admin/site/local-business/LocalBusinessEditor";
import ContactEditor from "@/app/(admin)/admin/site/contact/ContactEditor";
import SettingsEditor from "@/app/(admin)/admin/settings/SettingsEditor";
import { DEFAULT_HOME_CONTENT } from "@/lib/home-content";
import { DEFAULT_BUSINESS_DETAILS } from "@/lib/business-detail-content";
import { DEFAULT_LISTING_CONTENT } from "@/lib/listing-content";
import { DEFAULT_LOCAL_BUSINESS } from "@/lib/local-business-content";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/contact-content";
import { normalizeSiteSettings } from "@/lib/settings";

const editors: [string, ReactElement][] = [
  ["Home", <HomeEditor key="h" content={DEFAULT_HOME_CONTENT} status="draft" seo={{}} />],
  ["Development", <BusinessDetailEditor key="b" slug="real-estate-development" content={DEFAULT_BUSINESS_DETAILS["real-estate-development"]} status="draft" seo={{}} />],
  ["Careers listing", <ListingEditor key="l" slug="careers" content={DEFAULT_LISTING_CONTENT.careers} status="draft" seo={{}} />],
  ["Local business", <LocalBusinessEditor key="lb" content={DEFAULT_LOCAL_BUSINESS} status="draft" seo={{}} />],
  ["Contact", <ContactEditor key="c" content={DEFAULT_CONTACT_CONTENT} status="draft" seo={{}} />],
  ["Settings", <SettingsEditor key="s" settings={normalizeSiteSettings({})} />],
];

function render(element: ReactElement) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(element);
  return host;
}

describe("content editors share the Home page editor's look", () => {
  it.each(editors)("%s: values are not nested in bold labels, labels are uppercase", (_name, element) => {
    const host = render(element);
    // A control inside a bold <label> inherits its weight (inputs use `font: inherit`), so typed values render bold.
    const nested = [...host.querySelectorAll("label")].filter((l) => l.querySelector("input:not([type=checkbox]):not([type=radio]), textarea, select"));
    expect(nested.map((l) => l.textContent)).toEqual([]);
    const plain = [...host.querySelectorAll<HTMLLabelElement>("label")].filter((l) => !l.querySelector("input"));
    expect(plain.length).toBeGreaterThan(0);
    for (const label of plain) expect(label.style.textTransform, label.textContent ?? "").toBe("uppercase");
  });

  it.each(editors)("%s: has an explicit submit button so the page rail and save bar attach", (_name, element) => {
    expect(render(element).querySelector("form button[type=submit]")).not.toBeNull();
  });
});
