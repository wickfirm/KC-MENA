import { queryOne } from "@/lib/db";
import ProjectEditor from "./ProjectEditor";
export const dynamic = "force-dynamic";
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
 const { id }=await params; const project=id === "new" ? null : await queryOne("SELECT * FROM projects WHERE id=$1",[Number(id)]);
 return <><h1 style={{fontSize:"1.6rem",marginBottom:22}}>{id === "new" ? "New Project" : "Edit Project"}</h1>{id === "new" || project ? <ProjectEditor project={project as never} /> : <div className="card">Project not found.</div>}</>;
}
