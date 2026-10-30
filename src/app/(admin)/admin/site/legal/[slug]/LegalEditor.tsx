"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { LegalBlock, LegalContent, LegalRun, LegalSlug } from "@/lib/legal-content";
import { labelStyle, sectionHeading, sectionStyle } from "@/components/admin/editor-styles";
import TypeFields, { readTypeScale } from "@/components/admin/TypeFields";

function Field({ label, value, onChange, area = false }: { label: string; value: string; onChange: (value: string) => void; area?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {area ? <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}
    </div>
  );
}

function paragraphText(runs: LegalRun[]): string {
  return runs.map((run) => run.text).join("");
}

function linksIn(runs: LegalRun[]): Array<{ label: string; href: string }> {
  return runs.filter((run) => run.href).map((run) => ({ label: run.text, href: run.href ?? "" }));
}

function runsFrom(text: string, links: Array<{ label: string; href: string }>): LegalRun[] {
  let rest = text;
  const runs: LegalRun[] = [];
  const missing: Array<{ label: string; href: string }> = [];
  for (const link of links) {
    if (!link.label) continue;
    const at = rest.indexOf(link.label);
    if (at < 0) {
      missing.push(link);
      continue;
    }
    if (at > 0) runs.push({ text: rest.slice(0, at) });
    runs.push({ text: link.label, href: link.href });
    rest = rest.slice(at + link.label.length);
  }
  if (rest) runs.push({ text: rest });
  for (const link of missing) runs.push({ text: link.label, href: link.href });
  return runs.length ? runs : [{ text: "" }];
}

export default function LegalEditor({ slug, content, status, seo }: { slug: LegalSlug; content: LegalContent; status: "draft" | "published"; seo: { title?: string; description?: string } }) {
  const router = useRouter();
  const [doc, setDoc] = useState(content);
  const [pageStatus, setPageStatus] = useState(status);
  const [seoTitle, setSeoTitle] = useState(seo.title ?? "");
  const [seoDescription, setSeoDescription] = useState(seo.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function updateSection(index: number, patch: Partial<LegalContent["sections"][number]>) {
    setDoc({ ...doc, sections: doc.sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section) });
  }

  function updateBlock(sectionIndex: number, blockIndex: number, block: LegalBlock) {
    const section = doc.sections[sectionIndex];
    updateSection(sectionIndex, { blocks: section.blocks.map((item, index) => index === blockIndex ? block : item) });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/site-pages/legal/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pageStatus, seo: { title: seoTitle, description: seoDescription }, content: { ...doc, type: readTypeScale((name) => String(new FormData(event.currentTarget).get(name) ?? "").trim(), "page") } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Save failed");
      router.refresh();
      setNotice(pageStatus === "published" ? "Saved and published — the change is live on the public site." : "Saved as a draft — the public page is unchanged until you publish it.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 960 }}>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16 }}>
        <div>
          <label htmlFor="status" style={labelStyle}>Status</label>
          <select id="status" value={pageStatus} onChange={(event) => setPageStatus(event.target.value as "draft" | "published")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <Field label="SEO title" value={seoTitle} onChange={setSeoTitle} />
      </div>
      <Field label="SEO description" value={seoDescription} onChange={setSeoDescription} area />
      <TypeFields prefix="page" value={doc.type} legend="This page — overrides the site-wide type" />

      <section style={sectionStyle}>
        <h2 style={sectionHeading}>Page heading</h2>
        <Field label="Eyebrow" value={doc.eyebrow} onChange={(eyebrow) => setDoc({ ...doc, eyebrow })} />
        <Field label="Title" value={doc.title} onChange={(title) => setDoc({ ...doc, title })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Updated label" value={doc.meta.updatedLabel} onChange={(updatedLabel) => setDoc({ ...doc, meta: { ...doc.meta, updatedLabel } })} />
          <Field label="Updated date" value={doc.meta.updated} onChange={(updated) => setDoc({ ...doc, meta: { ...doc.meta, updated } })} />
        </div>
        <Field label="Company" value={doc.meta.company} onChange={(company) => setDoc({ ...doc, meta: { ...doc.meta, company } })} />
        <Field label="Location" value={doc.meta.location} onChange={(location) => setDoc({ ...doc, meta: { ...doc.meta, location } })} />
      </section>

      {doc.sections.map((section, sectionIndex) => (
        <section key={sectionIndex} style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <h2 style={sectionHeading}>Section {sectionIndex + 1}</h2>
            <button type="button" className="btn" onClick={() => setDoc({ ...doc, sections: doc.sections.filter((_, index) => index !== sectionIndex) })}>Remove section</button>
          </div>
          <Field label="Heading" value={section.heading} onChange={(heading) => updateSection(sectionIndex, { heading })} />
          {section.blocks.map((block, blockIndex) => (
            <div key={blockIndex} style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 14 }}>
              {block.type === "paragraph" && (
                <>
                  <Field label="Paragraph" value={paragraphText(block.runs)} area onChange={(text) => updateBlock(sectionIndex, blockIndex, { type: "paragraph", runs: runsFrom(text, linksIn(block.runs)) })} />
                  {linksIn(block.runs).map((link, linkIndex) => (
                    <div key={linkIndex} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
                      <Field label="Link text" value={link.label} onChange={(label) => {
                        const links = linksIn(block.runs).map((item, index) => index === linkIndex ? { ...item, label } : item);
                        updateBlock(sectionIndex, blockIndex, { type: "paragraph", runs: runsFrom(paragraphText(block.runs).replace(link.label, label), links) });
                      }} />
                      <Field label="Link URL" value={link.href} onChange={(href) => {
                        const links = linksIn(block.runs).map((item, index) => index === linkIndex ? { ...item, href } : item);
                        updateBlock(sectionIndex, blockIndex, { type: "paragraph", runs: runsFrom(paragraphText(block.runs), links) });
                      }} />
                      <button type="button" className="btn" style={{ marginBottom: 14 }} onClick={() => {
                        const links = linksIn(block.runs).filter((_, index) => index !== linkIndex);
                        updateBlock(sectionIndex, blockIndex, { type: "paragraph", runs: runsFrom(paragraphText(block.runs), links) });
                      }}>Remove link</button>
                    </div>
                  ))}
                  <button type="button" className="btn" onClick={() => updateBlock(sectionIndex, blockIndex, { type: "paragraph", runs: [...block.runs, { text: "link text", href: "https://" }] })}>Add link</button>
                </>
              )}
              {block.type === "list" && (
                <>
                  <Field label="List items (bold label | text, one per line)" area value={block.items.map((item) => item.lead ? `${item.lead} | ${item.text}` : item.text).join("\n")} onChange={(value) => updateBlock(sectionIndex, blockIndex, { type: "list", items: value.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
                    const split = line.split("|");
                    return split.length > 1 ? { lead: split[0].trim(), text: split.slice(1).join("|").trim() } : { lead: "", text: line.trim() };
                  }) })} />
                </>
              )}
              {block.type === "button" && <Field label="Button label" value={block.label} onChange={(label) => updateBlock(sectionIndex, blockIndex, { type: "button", label })} />}
              <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => updateSection(sectionIndex, { blocks: section.blocks.filter((_, index) => index !== blockIndex) })}>Remove block</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button type="button" className="btn" onClick={() => updateSection(sectionIndex, { blocks: [...section.blocks, { type: "paragraph", runs: [{ text: "" }] }] })}>Add paragraph</button>
            <button type="button" className="btn" onClick={() => updateSection(sectionIndex, { blocks: [...section.blocks, { type: "list", items: [{ lead: "", text: "" }] }] })}>Add list</button>
            <button type="button" className="btn" onClick={() => updateSection(sectionIndex, { blocks: [...section.blocks, { type: "button", label: "Open Cookie Settings" }] })}>Add button</button>
          </div>
        </section>
      ))}

      <button type="button" className="btn" style={{ marginTop: 18 }} onClick={() => setDoc({ ...doc, sections: [...doc.sections, { heading: "New section", blocks: [{ type: "paragraph", runs: [{ text: "" }] }] }] })}>Add section</button>
      <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
        <button className="btn btn-dark" type="submit" disabled={saving}>{saving ? "Saving…" : "Save legal page"}</button>
        <a className="btn" target="_blank" href={`/${slug}/`}>View public page</a>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {notice && <p className="success-msg" aria-live="polite">{notice}</p>}
    </form>
  );
}
