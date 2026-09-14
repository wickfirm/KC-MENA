import Link from "next/link";
import { query } from "@/lib/db";
export const dynamic="force-dynamic";

export default async function JobsAdmin() {
 let rows: {id:number;title:string;department:string|null;location:string|null;status:string;closing_date:string|null}[]=[];let error=false;try{rows=await query("SELECT id,title,department,location,status,closing_date FROM job_openings ORDER BY created_at DESC")}catch{error=true}
  return (
    <><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><h1 style={{fontSize:"1.6rem"}}>Careers</h1><Link href="/admin/jobs/new" className="btn btn-dark">+ New Opening</Link></div>{error?<div className="card">Database not connected.</div>:rows.length===0?<div className="card">No job openings yet. <Link href="/admin/jobs/new" style={{textDecoration:"underline",fontWeight:700}}>Create the first one</Link>.</div>:<div className="card" style={{padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{rows.map(r=><tr key={r.id} style={{borderBottom:"1px solid var(--line)"}}><td style={{padding:"12px 16px",fontWeight:600}}>{r.title}</td><td style={{padding:"12px 16px"}}>{r.department??"—"}</td><td style={{padding:"12px 16px"}}>{r.location??"—"}</td><td style={{padding:"12px 16px"}}><span className={`status-pill status-${r.status}`}>{r.status}</span></td><td style={{padding:"12px 16px"}}><Link href={`/admin/jobs/${r.id}`} style={{fontWeight:700,textDecoration:"underline"}}>Edit</Link></td></tr>)}</tbody></table></div>}</>
  );
}
