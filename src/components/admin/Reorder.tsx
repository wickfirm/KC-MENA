"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { reorder } from "@/lib/reorder";

type Entity = "faq" | "project";

/** Ids of the server-rendered rows of one group, in the order they appear on screen. */
function groupIds(group: string): number[] {
  return Array.from(document.querySelectorAll<HTMLElement>("tr[data-reorder-row]"))
    .filter((row) => row.dataset.group === group)
    .map((row) => Number(row.dataset.id));
}

async function saveOrder(entity: Entity, ids: number[]): Promise<string | null> {
  try {
    const res = await fetch("/api/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity, ids }) });
    if (res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data.error ?? "Could not save the new order";
  } catch {
    return "Network error — the order was not saved";
  }
}

/**
 * Drag-and-drop reordering for a list screen. Rows tagged data-reorder-row / data-id / data-group can be dragged
 * onto another row of the same group; the new order is saved immediately. Up/Down buttons (ReorderButtons)
 * remain for keyboard use. Only mounted for roles that may change the live order.
 */
export function ReorderRows({ entity }: { entity: Entity }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let dragged: HTMLElement | null = null;
    const rowOf = (target: EventTarget | null) => (target as HTMLElement | null)?.closest?.("tr[data-reorder-row]") as HTMLElement | null;
    const clear = () => document.querySelectorAll(".is-over").forEach((el) => el.classList.remove("is-over"));

    const onStart = (event: DragEvent) => {
      const row = rowOf(event.target);
      if (!row || !event.dataTransfer) return;
      dragged = row;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", row.dataset.id ?? "");
      row.classList.add("is-dragging");
    };
    const onOver = (event: DragEvent) => {
      const row = rowOf(event.target);
      if (!dragged || !row || row === dragged || row.dataset.group !== dragged.dataset.group) return;
      event.preventDefault();
      clear();
      row.classList.add("is-over");
    };
    const onEnd = () => {
      dragged?.classList.remove("is-dragging");
      dragged = null;
      clear();
    };
    const onDrop = async (event: DragEvent) => {
      const target = rowOf(event.target);
      const source = dragged;
      onEnd();
      if (!source || !target || target === source || target.dataset.group !== source.dataset.group) return;
      event.preventDefault();
      const ids = groupIds(source.dataset.group ?? "");
      const next = reorder(ids, ids.indexOf(Number(source.dataset.id)), ids.indexOf(Number(target.dataset.id)));
      if (next === ids) return;
      setNotice("Saving the new order…");
      const error = await saveOrder(entity, next);
      setNotice(error ?? "Order saved.");
      if (!error) router.refresh();
    };

    // Make rows draggable only after hydration, so the server-rendered markup is never touched mid-hydration.
    const timer = setTimeout(() => document.querySelectorAll<HTMLElement>("tr[data-reorder-row]").forEach((row) => (row.draggable = true)), 500);
    document.addEventListener("dragstart", onStart);
    document.addEventListener("dragover", onOver);
    document.addEventListener("dragend", onEnd);
    document.addEventListener("drop", onDrop);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("dragstart", onStart);
      document.removeEventListener("dragover", onOver);
      document.removeEventListener("dragend", onEnd);
      document.removeEventListener("drop", onDrop);
    };
  }, [entity, router]);

  return (
    <p className="cms-reorder-hint" role="status" aria-live="polite" style={{ margin: "0 0 12px", fontSize: ".8rem", color: "var(--grey-5)" }}>
      {notice || "Drag a row onto another row of the same group to change the order, or use the ↑ ↓ buttons."}
    </p>
  );
}

/** ↑ / ↓ buttons for one row: the keyboard-friendly alternative to dragging. */
export function ReorderButtons({ entity, id, group }: { entity: Entity; id: number; group: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function move(delta: -1 | 1) {
    const ids = groupIds(group);
    const from = ids.indexOf(id);
    const next = reorder(ids, from, from + delta);
    if (next === ids) return;
    setBusy(true);
    const error = await saveOrder(entity, next);
    setBusy(false);
    if (error) window.alert(error);
    else router.refresh();
  }

  const style = { padding: "2px 8px", fontSize: ".75rem", marginLeft: 6 } as const;
  return (
    <>
      <button type="button" className="btn" style={style} disabled={busy} data-requires="publish" aria-label="Move up" title="Move up" onClick={() => move(-1)}>↑</button>
      <button type="button" className="btn" style={style} disabled={busy} data-requires="publish" aria-label="Move down" title="Move down" onClick={() => move(1)}>↓</button>
    </>
  );
}
