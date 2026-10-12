"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Item = { id: string; label: string; collapsible: boolean };

/**
 * Long-page UX for every admin editor, mounted once in the admin layout (the KPD CMS pattern):
 *  - a sticky "On this page" rail built from the form's own section headings (jump, follow scroll);
 *  - click a section heading to collapse/expand it; "Collapse all / Expand all" in the rail;
 *  - a sticky save bar so Save is always in reach however far down you are.
 * It reads the rendered form, so editors need no changes. Forms with fewer than three sections
 * only get the save bar; screens without a form get nothing.
 */
/** Screens whose form is a content editor (not search boxes or the team form). */
const EDITOR_PATH = /^\/admin\/(site\/|pages\/|news\/|faqs\/|jobs\/|projects\/|settings)/;

/** Editors that can show their unsaved changes in a preview tab (see src/lib/preview-drafts.ts). */
const PREVIEW_PATH = /^\/admin\/(site\/(home|about|local-business|business\/[^/]+|listing\/[^/]+)|news\/[^/]+)\/?$/;

type PreviewIntent = { win: Window | null };

export default function EditorEnhancer({ role = "editor" }: { role?: string }) {
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [hasForm, setHasForm] = useState(false);
  const [active, setActive] = useState("");
  const [allCollapsed, setAllCollapsed] = useState(false);
  const intent = useRef<PreviewIntent | null>(null);
  const canPreview = PREVIEW_PATH.test(pathname) && role !== "viewer";

  // "Preview unsaved": the editor's own save code builds the payload; this wrapper diverts that one request
  // to /api/preview-draft (a private, expiring draft) instead of saving, then opens the preview tab.
  useEffect(() => {
    const original = window.fetch;
    const wrapped: typeof window.fetch = async (input, init) => {
      const pending = intent.current;
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (pending && (method === "PUT" || method === "POST") && typeof init?.body === "string") {
        const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const path = new URL(href, window.location.origin).pathname;
        if (/^\/api\/(site-pages|news)(\/|$)/.test(path)) {
          intent.current = null;
          let payload: unknown;
          try {
            payload = JSON.parse(init.body);
          } catch {
            payload = null;
          }
          const res = await original("/api/preview-draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path, payload }) });
          const data = await res.json().catch(() => ({}));
          const headers = { "Content-Type": "application/json" };
          if (res.ok && data.url) {
            if (pending.win && !pending.win.closed) pending.win.location.href = data.url;
            else window.open(data.url, "_blank");
            return new Response(JSON.stringify({ error: "Preview opened in a new tab. Nothing was saved." }), { status: 409, headers });
          }
          pending.win?.close();
          return new Response(JSON.stringify({ error: data.error ?? "Could not prepare the preview." }), { status: res.status, headers });
        }
      }
      return original.call(window, input, init);
    };
    window.fetch = wrapped;
    return () => {
      if (window.fetch === wrapped) window.fetch = original;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const scan = () => {
      if (cancelled) return;
      if (!EDITOR_PATH.test(pathname)) {
        setHasForm(false);
        setItems([]);
        return;
      }
      const form = document.querySelector<HTMLFormElement>("main form.card, main form[data-editor]");
      const forms = Array.from(document.querySelectorAll<HTMLFormElement>("main form")).filter((f) => f.querySelector("button[type=submit]"));
      const target = form && forms.includes(form) ? form : forms[0];
      if (!target) {
        setHasForm(false);
        setItems([]);
        return;
      }
      target.classList.add("cms-enhanced");
      // View-only accounts: the server refuses writes anyway; disable the controls so it is obvious.
      if (role === "viewer") {
        target.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement>("input, textarea, select, button").forEach((el) => {
          el.disabled = true;
        });
      }
      const found: Item[] = [];
      target.querySelectorAll<HTMLElement>("h2").forEach((heading, index) => {
        if (heading.closest("details")) return;
        const section = heading.closest("section");
        const collapsible = Boolean(section && section.firstElementChild === heading && section.closest("form") === target);
        if (section && !collapsible) return; // a nested heading inside a section
        const label = heading.textContent?.trim();
        if (!label) return;
        const holder = collapsible ? section! : heading;
        if (!holder.id) holder.id = `cms-sec-${index}`;
        holder.style.scrollMarginTop = "16px";
        if (collapsible) section!.setAttribute("data-collapsible", "true");
        found.push({ id: holder.id, label, collapsible });
      });
      setHasForm(true);
      setItems(found.length >= 3 ? found : []);
      setActive(found[0]?.id ?? "");
    };
    // Scan only after React has hydrated the editor (touching server-rendered nodes earlier causes hydration
    // mismatches), and once more in case the sections render late.
    const timers = [setTimeout(scan, 450), setTimeout(scan, 1500)];
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [pathname, role]);

  // Click a section heading to collapse/expand it.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const heading = (event.target as HTMLElement | null)?.closest?.("h2");
      const section = heading?.closest("section[data-collapsible]");
      if (!heading || !section || section.firstElementChild !== heading) return;
      section.toggleAttribute("data-collapsed");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Follow the scroll position.
  useEffect(() => {
    if (!items.length || typeof IntersectionObserver === "undefined") return;
    const targets = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-60px 0px -65% 0px" }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.removeAttribute("data-collapsed");
    // A long smooth scroll reads as a pause before anything moves: animate short hops, jump long ones.
    const distance = Math.abs(el.getBoundingClientRect().top);
    el.scrollIntoView({ behavior: distance > 1200 ? "auto" : "smooth", block: "start" });
    setActive(id);
  }, []);

  const toggleAll = useCallback(() => {
    const sections = document.querySelectorAll("main form section[data-collapsible]");
    const collapse = !allCollapsed;
    sections.forEach((s) => (collapse ? s.setAttribute("data-collapsed", "") : s.removeAttribute("data-collapsed")));
    setAllCollapsed(collapse);
  }, [allCollapsed]);

  const save = useCallback(() => {
    const form = document.querySelector<HTMLFormElement>("main form.cms-enhanced");
    form?.requestSubmit();
  }, []);

  const preview = useCallback(() => {
    const form = document.querySelector<HTMLFormElement>("main form.cms-enhanced");
    if (!form) return;
    // Open the tab inside the click so the browser allows it; it is pointed at the preview once the draft is stored.
    const win = window.open("about:blank", "_blank");
    intent.current = { win };
    form.requestSubmit();
    window.setTimeout(() => {
      // The form did not submit (validation failed): drop the intent and the blank tab.
      if (intent.current?.win === win) {
        intent.current = null;
        win?.close();
      }
    }, 6000);
  }, []);

  if (!hasForm) return null;
  const readOnly = role === "viewer";
  return (
    <>
      {items.length > 0 && (
        <nav className="cms-rail" aria-label="On this page">
          <span className="cms-rail__title">On this page</span>
          <ol>
            {items.map((item) => (
              <li key={item.id}>
                <button type="button" className={active === item.id ? "is-active" : undefined} aria-current={active === item.id ? "true" : undefined} onClick={() => jump(item.id)}>
                  {item.label}
                </button>
              </li>
            ))}
          </ol>
          {items.some((i) => i.collapsible) && (
            <button type="button" className="cms-rail__toggle" onClick={toggleAll}>
              {allCollapsed ? "Expand all" : "Collapse all"}
            </button>
          )}
        </nav>
      )}
      {!readOnly && (
      <div className="cms-savebar" role="region" aria-label="Save">
        <span className="cms-savebar__hint">{items.length ? "Click a section heading to collapse it." : "Changes are saved when you press Save."}</span>
        <button type="button" className="cms-savebar__top" onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}>
          ↑ Top
        </button>
        {canPreview && (
          <button type="button" className="btn" onClick={preview} title="Opens a preview of what you have typed, without saving">
            Preview unsaved
          </button>
        )}
        <button type="button" className="btn btn-dark" onClick={save}>
          Save changes
        </button>
      </div>
      )}
    </>
  );
}
