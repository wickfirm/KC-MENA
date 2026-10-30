import VersionHistory from "@/components/admin/VersionHistory";
import { queryOne } from "@/lib/db";
import MissingCmsContent from "@/components/admin/MissingCmsContent";
import { isAboutContent, type AboutContent } from "@/lib/about-content";
import AboutEditor from "./AboutEditor";
export const dynamic = "force-dynamic";
export default async function AboutAdminPage(){let page:{status:"draft"|"published";content:unknown;seo:{title?:string;description?:string}|null}|null=null;try{page=await queryOne("SELECT status,content,seo FROM pages WHERE slug='about-us'")}catch{}return <><h1 style={{fontSize:"1.6rem",marginBottom:6}}>About Us</h1><p style={{color:"var(--grey-5)",marginBottom:22}}>Manage the About Us template, leadership message, and company positioning.</p>{isAboutContent(page?.content)?<AboutEditor content={page.content} status={page?.status??"draft"} seo={page?.seo??{}}/>:<MissingCmsContent name="About Us"/>}<VersionHistory entity="page" entityId="about-us" /></>}
