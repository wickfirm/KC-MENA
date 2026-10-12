import Link from "next/link";
import { getSession } from "@/lib/auth";
import { can, roles, roleLabels, roleSummaries, roleLabel } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const sections = [
  { id: "start", title: "Getting started" },
  { id: "roles", title: "Roles: who can do what" },
  { id: "long-pages", title: "Editing long pages" },
  { id: "preview", title: "Previewing your changes" },
  { id: "status", title: "Draft, review and published" },
  { id: "news", title: "News workflow" },
  { id: "versions", title: "Version history" },
  { id: "media", title: "Media library" },
  { id: "inbox", title: "Submissions and CVs" },
  { id: "order", title: "Reordering FAQs and projects" },
  { id: "help", title: "If something looks wrong" },
];

const h2 = { fontSize: "1.25rem", margin: "34px 0 10px" } as const;
const p = { lineHeight: 1.65, maxWidth: "72ch", marginBottom: 10 } as const;

export default async function GuidePage() {
  const session = await getSession();
  const role = session?.role;
  return (
    <>
      <h1 style={{ marginBottom: 6 }}>CMS guide</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 18 }}>
        How the console works, written for the people who use it. You are signed in as <strong>{roleLabel(role)}</strong>.
      </p>
      <nav aria-label="Guide sections" className="card" style={{ maxWidth: 760, marginBottom: 8 }}>
        <ol style={{ margin: 0, paddingLeft: 20, columns: 2, columnGap: 32, lineHeight: 1.9 }}>
          {sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} style={{ textDecoration: "underline" }}>{s.title}</a></li>
          ))}
        </ol>
      </nav>

      <section id="start">
        <h2 style={h2}>Getting started</h2>
        <p style={p}>Sign in at <code>/admin</code>. The black menu on the left is grouped: <strong>Site pages</strong> (the fixed pages of the website), <strong>Content</strong> (news, FAQ, projects, careers, media), <strong>Inbox</strong> (submissions and the RSS queue) and, for administrators, <strong>Administration</strong>. The red marker shows where you are. Change your own password under <Link href="/admin/account" style={{ textDecoration: "underline" }}>My account</Link>.</p>
        <p style={p}>The Dashboard lists what needs attention (news waiting for review, the RSS queue, submissions) and has shortcuts for common jobs.</p>
      </section>

      <section id="roles">
        <h2 style={h2}>Roles: who can do what</h2>
        <div className="card" style={{ maxWidth: 820 }}>
          <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px 18px", margin: 0 }}>
            {roles.map((r) => (
              <div key={r} style={{ display: "contents" }}>
                <dt style={{ fontWeight: 700 }}>{roleLabels[r]}{r === role ? " (you)" : ""}</dt>
                <dd style={{ margin: 0, color: "var(--grey-6)" }}>{roleSummaries[r]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p style={{ ...p, marginTop: 10 }}>Buttons you cannot use are hidden, and the server refuses the action even if you reach it another way. Only administrators delete permanently, so if something must be removed, ask one.</p>
      </section>

      <section id="long-pages">
        <h2 style={h2}>Editing long pages</h2>
        <p style={p}>Page editors can be long. On a wide screen an <strong>On this page</strong> list sits on the right: click a name to jump there, and it follows you as you scroll. <strong>Click a section heading</strong> to fold it away, or use <strong>Collapse all / Expand all</strong>. The bar at the bottom always shows <strong>Save changes</strong>, so you never need to scroll back down.</p>
        <p style={p}>If you have edited something and try to leave, the CMS warns you first. An amber <em>Unsaved changes</em> badge shows while there is something unsaved.</p>
      </section>

      <section id="preview">
        <h2 style={h2}>Previewing your changes</h2>
        <p style={p}><strong>Preview unsaved</strong> (bottom bar) opens a new tab showing the page <em>exactly as you have typed it</em>, without saving anything. The tab says so at the top. Use it before you save or publish. The temporary copy is private to you and disappears after two hours.</p>
        <p style={p}><strong>Preview draft</strong> (next to the Save button) shows the last <em>saved</em> version instead, including pages still set to Draft. Unsaved typing is not included there.</p>
        {can(role, "content.editLive") ? null : <p style={p}>Contributors can preview their news drafts. The fixed site pages are edited by Editors.</p>}
      </section>

      <section id="status">
        <h2 style={h2}>Draft, review and published</h2>
        <p style={p}>A page or post set to <strong>Draft</strong> is saved but invisible to visitors; <strong>In review</strong> (news) means it is waiting for an Editor; <strong>Published</strong> is live. Saving a published page changes the live site straight away, so check with Preview unsaved first. The message under the Save button always says whether your save went live.</p>
      </section>

      <section id="news">
        <h2 style={h2}>News workflow</h2>
        <p style={p}>A Contributor writes a post and saves it as Draft, or sets <em>In review</em> when it is ready. An Editor opens it from <strong>News</strong>, previews it, and sets it to Published. The RSS queue (Inbox) works the same way: approving a feed item creates a <em>draft</em> post that an Editor still has to publish.</p>
      </section>

      <section id="versions">
        <h2 style={h2}>Version history</h2>
        <p style={p}>Every save keeps a version. Open <strong>Version history</strong> under an editor to see the last ten saves, who made them and when. <strong>Restore</strong> puts an older version back; the current content is kept as a version too, so a restore can be undone. Version history starts from a record&apos;s first save after the feature was added.</p>
      </section>

      <section id="media">
        <h2 style={h2}>Media library</h2>
        <p style={p}>Upload images or PDFs (up to 25 MB) in <strong>Media</strong>. Use <strong>Copy URL</strong> to paste a file into any editor, and give every image <strong>Alt text</strong>: it describes the picture for screen readers and search engines. Removing a file from the library does not delete it from storage, so pages that already use it keep working.</p>
      </section>

      <section id="inbox">
        <h2 style={h2}>Submissions and CVs</h2>
        <p style={p}>Every enquiry and job application is stored first. Open one to read the full message and, for applications, download the CV (CVs are private and only reachable here). The <strong>Salesforce</strong> status shows <em>pending</em> until the integration is switched on, <em>synced</em> when the lead was created, and <em>failed</em> with the reason if it could not be sent. Failed ones have a <strong>Retry sync</strong> button.</p>
      </section>

      <section id="order">
        <h2 style={h2}>Reordering FAQs and projects</h2>
        <p style={p}>On the FAQ and Projects lists, <strong>drag a row</strong> onto another row of the same group (the same FAQ category, or the same project sector) to change the order on the website, or use the <strong>↑ ↓</strong> buttons. The new order is saved immediately.</p>
      </section>

      <section id="help">
        <h2 style={h2}>If something looks wrong</h2>
        <p style={p}>A change you saved but cannot see on the website: check the page&apos;s status (Draft is invisible), then hard-refresh the public page. If a save fails, the message under the button says why. For anything else, report it to the project team with the page, what you did, and what you expected.</p>
      </section>
    </>
  );
}
