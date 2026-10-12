// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { ReorderButtons, ReorderRows } from "./Reorder";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
const realFetch = globalThis.fetch;
let calls: { url: string; body: unknown }[] = [];

function table() {
  document.body.innerHTML = `<table><tbody>
    <tr data-reorder-row data-id="1" data-group="General"><td>one <span id="b1"></span></td></tr>
    <tr data-reorder-row data-id="2" data-group="General"><td>two <span id="b2"></span></td></tr>
    <tr data-reorder-row data-id="3" data-group="General"><td>three <span id="b3"></span></td></tr>
    <tr data-reorder-row data-id="9" data-group="Other"><td>other</td></tr>
  </tbody></table><div id="mount"></div>`;
}

function dragEvent(type: string, target: Element) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  (event as unknown as { dataTransfer: unknown }).dataTransfer = { effectAllowed: "", setData: vi.fn(), setDragImage: vi.fn() };
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  vi.useFakeTimers();
  refresh.mockReset();
  calls = [];
  globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;
  table();
});
afterEach(async () => {
  await act(async () => root?.unmount());
  globalThis.fetch = realFetch;
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("ReorderRows", () => {
  it("makes rows draggable after hydration and saves the new order for the group on drop", async () => {
    root = createRoot(document.getElementById("mount")!);
    await act(async () => root.render(<ReorderRows entity="faq" />));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    const rows = [...document.querySelectorAll<HTMLElement>("tr[data-reorder-row]")];
    expect(rows.every((r) => r.draggable)).toBe(true);

    await act(async () => {
      dragEvent("dragstart", rows[0]); // drag "one"
      dragEvent("dragover", rows[2]);
      dragEvent("drop", rows[2]); // onto "three"
    });
    expect(calls).toEqual([{ url: "/api/reorder", body: { entity: "faq", ids: [2, 3, 1] } }]);
    expect(refresh).toHaveBeenCalled();
  });

  it("ignores drops onto a row of another group", async () => {
    root = createRoot(document.getElementById("mount")!);
    await act(async () => root.render(<ReorderRows entity="faq" />));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    const rows = [...document.querySelectorAll<HTMLElement>("tr[data-reorder-row]")];
    await act(async () => {
      dragEvent("dragstart", rows[0]);
      dragEvent("drop", rows[3]);
    });
    expect(calls).toEqual([]);
  });
});

describe("ReorderButtons", () => {
  it("moves a row down by one within its group", async () => {
    root = createRoot(document.getElementById("b1")!);
    await act(async () => root.render(<ReorderButtons entity="project" id={1} group="General" />));
    const down = document.querySelector<HTMLButtonElement>('button[aria-label="Move down"]')!;
    await act(async () => down.click());
    expect(calls).toEqual([{ url: "/api/reorder", body: { entity: "project", ids: [2, 1, 3] } }]);
  });

  it("does nothing when the first row is moved up", async () => {
    root = createRoot(document.getElementById("b1")!);
    await act(async () => root.render(<ReorderButtons entity="faq" id={1} group="General" />));
    await act(async () => document.querySelector<HTMLButtonElement>('button[aria-label="Move up"]')!.click());
    expect(calls).toEqual([]);
  });
});
