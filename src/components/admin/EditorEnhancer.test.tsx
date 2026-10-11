// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";

let pathname = "/admin/site/home";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

import EditorEnhancer from "./EditorEnhancer";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** A trimmed copy of what the real editors render: <main><form class="card"> with <section><h2>…</h2> blocks. */
function mountEditorForm(sections = ["Hero", "About", "Metrics", "Search appearance"]) {
  document.body.innerHTML = `<main><form class="card">
    <div><label>Status</label><select><option>Draft</option></select></div>
    ${sections.map((s) => `<section><h2>${s}</h2><label>${s} field</label><input name="${s}" /></section>`).join("")}
    <button type="submit">Save</button>
  </form></main><div id="enhancer"></div>`;
}

let root: Root;
async function mount(role = "editor") {
  root = createRoot(document.getElementById("enhancer")!);
  // Effects (and the timers they schedule) are flushed when the first act() ends; advance time in a second one.
  await act(async () => {
    root.render(<EditorEnhancer role={role} />);
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  pathname = "/admin/site/home";
});
afterEach(async () => {
  await act(async () => root?.unmount());
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("EditorEnhancer", () => {
  it("builds the 'On this page' rail from section headings and adds a save bar", async () => {
    mountEditorForm();
    await mount();
    const rail = [...document.querySelectorAll(".cms-rail li button")].map((b) => b.textContent);
    expect(rail).toEqual(["Hero", "About", "Metrics", "Search appearance"]);
    expect(document.querySelector(".cms-savebar")).not.toBeNull();
    expect(document.querySelector("main form")?.classList.contains("cms-enhanced")).toBe(true);
    expect(document.querySelectorAll("main form section[data-collapsible]")).toHaveLength(4);
  });

  it("collapses a section when its heading is clicked and expands it again", async () => {
    mountEditorForm();
    await mount();
    const section = document.querySelector("main form section") as HTMLElement;
    const heading = section.querySelector("h2") as HTMLElement;
    await act(async () => heading.click());
    expect(section.hasAttribute("data-collapsed")).toBe(true);
    await act(async () => heading.click());
    expect(section.hasAttribute("data-collapsed")).toBe(false);
  });

  it("'Collapse all' / 'Expand all' toggles every section", async () => {
    mountEditorForm();
    await mount();
    const toggle = document.querySelector(".cms-rail__toggle") as HTMLButtonElement;
    expect(toggle.textContent).toBe("Collapse all");
    await act(async () => toggle.click());
    expect(document.querySelectorAll("main form section[data-collapsed]")).toHaveLength(4);
    expect(toggle.textContent).toBe("Expand all");
    await act(async () => toggle.click());
    expect(document.querySelectorAll("main form section[data-collapsed]")).toHaveLength(0);
  });

  it("save bar submits the editor form", async () => {
    mountEditorForm();
    await mount();
    const form = document.querySelector("main form") as HTMLFormElement;
    form.requestSubmit = vi.fn();
    await act(async () => (document.querySelector(".cms-savebar .btn-dark") as HTMLButtonElement).click());
    expect(form.requestSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows no rail for short forms but still offers the save bar", async () => {
    mountEditorForm(["Only one", "Another"]);
    await mount();
    expect(document.querySelector(".cms-rail")).toBeNull();
    expect(document.querySelector(".cms-savebar")).not.toBeNull();
  });

  it("does nothing on non-editor screens (e.g. submissions search)", async () => {
    pathname = "/admin/submissions";
    mountEditorForm();
    await mount();
    expect(document.querySelector(".cms-rail")).toBeNull();
    expect(document.querySelector(".cms-savebar")).toBeNull();
  });

  it("makes the form read-only for viewers and hides the save bar", async () => {
    mountEditorForm();
    await mount("viewer");
    expect((document.querySelector("main form input") as HTMLInputElement).disabled).toBe(true);
    expect((document.querySelector("main form select") as HTMLSelectElement).disabled).toBe(true);
    expect(document.querySelector(".cms-savebar")).toBeNull();
  });
});
