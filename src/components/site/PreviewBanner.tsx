/** Thin strip above admin previews: says what is being shown and links back to the editor. */
export default function PreviewBanner({ unsaved, editHref, note }: { unsaved: boolean; editHref: string; note?: string }) {
  return (
    <div style={{ background: "#fdf0d4", color: "#6b4a00", padding: "10px 20px", fontSize: ".85rem", fontWeight: 700, textAlign: "center" }}>
      {unsaved
        ? "Preview of your UNSAVED changes. Nothing has been saved or published."
        : "Preview of the last SAVED version. Unsaved edits in the editor are not shown."}
      {note ? ` ${note}` : ""}{" "}
      <a href={editHref} style={{ textDecoration: "underline" }}>Back to editor</a>
    </div>
  );
}
