import { query } from "@/lib/db";
export const dynamic="force-dynamic";

type Submission={id:number;type:string;name:string;email:string;phone:string|null;subject:string|null;message:string|null;sf_sync_status:string;created_at:string};
export default async function SubmissionsAdmin() {
 let rows:Submission[]=[];let error=false;try{rows=await query<Submission>("SELECT id,type,name,email,phone,subject,message,sf_sync_status,created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 250")}catch{error=true}
  return (
    <><h1 style={{fontSize:"1.6rem",marginBottom:6}}>Submissions</h1><p style={{color:"var(--grey-5)",marginBottom:20}}>Contact, enquiry, and career submissions stored by the website. Salesforce status is shown when the integration is configured.</p>{error?<div className="card">Database not connected.</div>:rows.length===0?<div className="card">No submissions yet. New public form submissions will appear here.</div>:<div className="card" style={{padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:".88rem"}}><thead><tr style={{textAlign:"left"}}>{["Type","Contact","Message","Sync","Received"].map(x=><th key={x} style={{padding:"12px 16px",fontSize:".72rem",color:"var(--grey-5)"}}>{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x.id} style={{borderTop:"1px solid var(--line)"}}><td style={{padding:"12px 16px"}}>{x.type}</td><td style={{padding:"12px 16px"}}><strong>{x.name}</strong><br/><a href={`mailto:${x.email}`} style={{textDecoration:"underline"}}>{x.email}</a>{x.phone&&<><br/>{x.phone}</>}</td><td style={{padding:"12px 16px",maxWidth:360}}>{x.subject&&<strong>{x.subject}<br/></strong>}{x.message??"—"}</td><td style={{padding:"12px 16px"}}><span className={`status-pill status-${x.sf_sync_status}`}>{x.sf_sync_status}</span></td><td style={{padding:"12px 16px"}}>{new Date(x.created_at).toLocaleString("en-GB")}</td></tr>)}</tbody></table></div>}</>
  );
}
