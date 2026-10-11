"use client";

import { useEffect, useState } from "react";

/**
 * Warns before leaving an admin editor with unsaved edits. Mounted once in the admin layout.
 * A form inside <main> becomes "dirty" on input/change, or on a plain (type="button")
 * click such as add/remove row; it is clean again when that form is submitted (editors
 * save through fetch in their onSubmit handler). Guards tab close/refresh (beforeunload)
 * and in-app link clicks. Destructive buttons (.btn-danger) do not mark a form dirty.
 */
export default function UnsavedGuard() {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const touched = new Set<HTMLFormElement>();
    const sync = () => setDirty(touched.size > 0);
    const formOf = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      const form = el?.closest?.("form");
      return form && form.closest("main") ? form : null;
    };

    const mark = (event: Event) => {
      const form = formOf(event.target);
      if (!form) return;
      if (event.type === "click") {
        const button = (event.target as HTMLElement).closest("button");
        if (!button || button.type !== "button" || button.classList.contains("btn-danger")) return;
      }
      touched.add(form);
      sync();
    };
    const clear = (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (touched.delete(form)) sync();
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (touched.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const linkClick = (event: MouseEvent) => {
      if (touched.size === 0 || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm("You have unsaved changes. Leave this page without saving?")) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        touched.clear();
        sync();
      }
    };

    document.addEventListener("input", mark, true);
    document.addEventListener("change", mark, true);
    document.addEventListener("click", mark, true);
    document.addEventListener("submit", clear, true);
    document.addEventListener("click", linkClick, true);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      document.removeEventListener("input", mark, true);
      document.removeEventListener("change", mark, true);
      document.removeEventListener("click", mark, true);
      document.removeEventListener("submit", clear, true);
      document.removeEventListener("click", linkClick, true);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  if (!dirty) return null;
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        right: 20,
        bottom: 72,
        zIndex: 50,
        background: "#fdf0d4",
        color: "#6b4a00",
        border: "1px solid #e6c36a",
        borderRadius: 3,
        padding: "8px 14px",
        fontSize: "0.8rem",
        fontWeight: 700,
      }}
    >
      Unsaved changes
    </div>
  );
}
