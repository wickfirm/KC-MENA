/** Move one entry of a list to another position. Returns the same array when the move is a no-op or out of range. */
export function reorder<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Re-assign a group's existing sort values to its items in a new order.
 *
 * Reordering inside a group (FAQs of one category, projects of one sector) must not disturb how the group
 * sits relative to other groups on the public site, so the same set of values is reused: the smallest value
 * goes to the new first item, and so on. Ties are broken by keeping the values in ascending order.
 */
export function assignSortSlots(orderedIds: number[], currentValues: Map<number, number>): Map<number, number> {
  const slots = orderedIds.map((id) => currentValues.get(id) ?? 0).sort((a, b) => a - b);
  // Equal slots would make the order depend on id again, so spread any duplicates upward by one each.
  for (let i = 1; i < slots.length; i += 1) {
    if (slots[i] <= slots[i - 1]) slots[i] = slots[i - 1] + 1;
  }
  return new Map(orderedIds.map((id, index) => [id, slots[index]]));
}
