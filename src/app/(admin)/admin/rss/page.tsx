import { query } from "@/lib/db";import RssSources from "./RssSources";import RssIngest from "./RssIngest";import RssReview from "./RssReview";
export const dynamic="force-dynamic";

type ReviewItem={id:number;title:string;link:string;summary:string|null;source_name:string|null;published_at:string|null;status:string;news_post_id:number|null};

export default async function RssAdmin() {
 let sources:{id:number;name:string;url:string;is_active:boolean}[]=[];let items:ReviewItem[]=[];let error=false;
 try{
   sources=await query("SELECT id,name,url,is_active FROM rss_sources ORDER BY created_at DESC");
   items=await query<ReviewItem>(
     `SELECT i.id, i.title, i.link, i.summary, s.name AS source_name, i.published_at, i.status, i.news_post_id
      FROM rss_items i LEFT JOIN rss_sources s ON s.id = i.source_id
      ORDER BY CASE i.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, i.fetched_at DESC
      LIMIT 100`)
 }catch{error=true}
  return (
    <><h1 style={{fontSize:"1.6rem",marginBottom:6}}>RSS Pipeline</h1><p style={{color:"var(--grey-5)",marginBottom:20}}>Register approved feeds, fetch new entries, then approve items into News as drafts.</p>{error?<div className="card">Database not connected.</div>:<><RssSources initial={sources}/><div className="card" style={{marginTop:20}}><strong>Fetch feeds</strong><p style={{color:"var(--grey-5)",marginTop:6,marginBottom:12}}>Pulls every active feed and queues new entries below. Already-imported items are skipped.</p><RssIngest/></div><div className="card" style={{marginTop:20}}><strong>Review queue</strong><RssReview initial={items}/></div></>}</>
  );
}
