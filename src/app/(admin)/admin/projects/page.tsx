import Link from "next/link";
import { query } from "@/lib/db";
export const dynamic = "force-dynamic";

type Row = { id: number; name: string; sector: string; status: string; location: string | null; updated_at: string };
export default async function ProjectsAdmin() {
  let rows: Row[] = []; let error = false;
  try { rows = await query<Row>("SELECT id,name,sector,status,location,updated_at FROM projects ORDER BY sector,sort_order,name LIMIT 200"); } catch { error = true; }
  return (
    <><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}><h1 style={{ fontSize: "1.6rem" }}>Projects</h1><Link href="/admin/projects/new" className="btn btn-dark">+ New Project</Link></div>
    <p style={{ color: "var(--grey-5)", marginBottom: 18 }}>Manage project cards, sector assignment, copy, media URLs, and publishing status.</p>
    {error ? <div className="card">Database not connected.</div> : rows.length === 0 ? <div className="card">No projects yet. <Link href="/admin/projects/new" style={{ textDecoration: "underline", fontWeight: 700 }}>Create the first one</Link>.</div> :
      <div className="card" style={{ padding: 0, overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ textAlign: "left" }}>{["Project","Sector","Location","Status",""] .map(h => <th key={h} style={{ padding: "12px 16px", fontSize: ".72rem", color: "var(--grey-5)" }}>{h}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r.id} style={{ borderTop: "1px solid var(--line)" }}><td style={{ padding: "12px 16px", fontWeight: 600 }}>{r.name}</td><td style={{ padding: "12px 16px" }}>{r.sector}</td><td style={{ padding: "12px 16px" }}>{r.location ?? "—"}</td><td style={{ padding: "12px 16px" }}><span className={`status-pill status-${r.status}`}>{r.status}</span></td><td style={{ padding: "12px 16px" }}><Link href={`/admin/projects/${r.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>Edit</Link></td></tr>)}</tbody></table></div>}</>
  );
}
