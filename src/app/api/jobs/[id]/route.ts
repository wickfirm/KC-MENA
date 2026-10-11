import { NextRequest, NextResponse } from "next/server";
import { getSession, denyUnlessCan } from "@/lib/auth";
import { logActivity, rowLabel, rowId } from "@/lib/activity";
import { recordVersion } from "@/lib/versions";
import { query,queryOne } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { JobPayload } from "../route";
export const dynamic="force-dynamic"; const valid=(v:string)=>{const n=Number(v);return Number.isInteger(n)?n:null};
export async function PUT(req:NextRequest,ctx:{params:Promise<{id:string}>}){const s = await getSession();
  const denied = denyUnlessCan(s, "content.editLive");
  if (denied || !s) return denied!;const id=valid((await ctx.params).id);if(!id)return NextResponse.json({error:"Invalid id"},{status:400});let p:JobPayload;try{p=await req.json()}catch{return NextResponse.json({error:"Invalid request body"},{status:400})}try{const rows=await query(`UPDATE job_openings SET title=COALESCE($2,title),slug=COALESCE($3,slug),department=$4,location=$5,employment=$6,description=$7,status=COALESCE($8,status),closing_date=$9,updated_at=now() WHERE id=$1 RETURNING *`,[id,p.title?.trim()||null,p.slug?slugify(p.slug):null,p.department?.trim()||null,p.location?.trim()||null,p.employment?.trim()||null,p.description?.trim()||null,["open","closed","draft"].includes(p.status??"")?p.status:null,p.closing_date||null]);if(rows[0])await logActivity({action:"content.save",summary:`Saved job “${rowLabel(rows[0])}”`,actor:s,entityType:"job",entityId:rowId(rows[0])});if(rows[0])await recordVersion("job",rows[0],s);return rows[0]?NextResponse.json({job:rows[0]}):NextResponse.json({error:"Job not found"},{status:404})}catch(err){console.error(err);return NextResponse.json({error:"Could not update job"},{status:500})}}
export async function DELETE(_req:NextRequest,ctx:{params:Promise<{id:string}>}){const s = await getSession();
  const denied = denyUnlessCan(s, "content.delete");
  if (denied || !s) return denied!;const id=valid((await ctx.params).id);if(!id)return NextResponse.json({error:"Invalid id"},{status:400});const row=await queryOne("DELETE FROM job_openings WHERE id=$1 RETURNING id",[id]);if(row)await logActivity({action:"content.delete",summary:`Deleted job #${id}`,actor:s,entityType:"job",entityId:id});return row?NextResponse.json({ok:true}):NextResponse.json({error:"Job not found"},{status:404})}
