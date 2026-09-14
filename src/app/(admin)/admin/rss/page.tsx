import { query } from "@/lib/db";import RssSources from "./RssSources";
export const dynamic="force-dynamic";

export default async function RssAdmin() {
 let sources:{id:number;name:string;url:string;is_active:boolean}[]=[];let items:{id:number;title:string;status:string;published_at:string|null}[]=[];let error=false;try{sources=await query("SELECT id,name,url,is_active FROM rss_sources ORDER BY created_at DESC");items=await query("SELECT id,title,status,published_at FROM rss_items ORDER BY fetched_at DESC LIMIT 100")}catch{error=true}
  return (
    <><h1 style={{fontSize:"1.6rem",marginBottom:6}}>RSS Pipeline</h1><p style={{color:"var(--grey-5)",marginBottom:20}}>Register approved RSS feeds. Feed ingestion and approval-to-News remain the next implementation step.</p>{error?<div className="card">Database not connected.</div>:<><RssSources initial={sources}/><div className="card" style={{marginTop:20}}><strong>Review queue</strong><p style={{color:"var(--grey-5)",marginTop:6}}>{items.length?`${items.length} imported item(s) available for review.`:"No imported feed items yet."}</p></div></>}</>
  );
}
