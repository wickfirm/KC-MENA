import type { PublicProject } from "@/lib/projects";

/**
 * "Our projects" band shown on business pages. Uses the shared public-site
 * classes (.section / .wrap / .head / .eyebrow / .btn) plus inline layout so
 * no new CSS needs to ship — mirrors the delivered design's card language.
 */
export default function ProjectsSection({ projects, eyebrow = "Our Projects", heading }: { projects: PublicProject[]; eyebrow?: string; heading: string }) {
  if (!projects.length) return null;
  return (
    <section className="section" style={{ background: "var(--grey-1)" }}>
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{heading}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, marginTop: 30 }}>
          {projects.map((project) => (
            <article key={project.id} style={{ background: "var(--white)", border: "1px solid var(--line)" }}>
              <div
                style={{ height: 180, background: `center / cover no-repeat url('${project.images[0] ?? "/images/city_tokyo.webp"}')` }}
                role="img"
                aria-label={project.name}
              />
              <div style={{ padding: "20px 22px 24px" }}>
                {project.location && (
                  <span style={{ display: "block", fontSize: ".7rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--grey-5)" }}>
                    {project.location}
                  </span>
                )}
                <h3 style={{ fontSize: "1.15rem", marginTop: 6 }}>{project.name}</h3>
                {project.summary && <p style={{ color: "var(--grey-5)", fontSize: ".9rem", marginTop: 10 }}>{project.summary}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}