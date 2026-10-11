"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

export default function EditorEnhancer({ role = "editor" }: { role?: string }) {
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [hasForm, setHasForm] = useState(false);
  const [active, setActive] = useState("");
  const [allCollapsed, setAllCollapsed] = useState(false);

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
        <button type="button" className="btn btn-dark" onClick={save}>
          Save changes
        </button>
      </div>
      )}
    </>
  );
}
