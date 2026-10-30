import { Fragment } from "react";
import type { LegalContent, LegalRun } from "@/lib/legal-content";
import { typeStyle, typeVars } from "@/lib/type-style";

function Runs({ runs }: { runs: LegalRun[] }) {
  return runs.map((run, index) =>
    run.href ? <a key={index} href={run.href}>{run.text}</a> : <span key={index}>{run.text}</span>
  );
}

/** Legal pages, rendered from structured fields in the same markup the client delivered. */
export default function LegalPageView({ content }: { content: LegalContent }) {
  const { meta } = content;
  return (
    <div style={typeVars(content.type, "page")}>
      <section className="legal-hero">
        <div className="wrap">
          <span className="eyebrow">{content.eyebrow}</span>
          <h1>{content.title}</h1>
        </div>
      </section>
      <section className="section legal-content">
        <div className="wrap legal-wrap">
          <aside className="legal-meta">
            <strong>{meta.updatedLabel}</strong>
            <br />
            {meta.updated}
            <br />
            <br />
            {meta.company}
            <br />
            {meta.location}
          </aside>
          <div className="legal-body">
            {content.sections.map((section) => section.hidden ? null : (
              <Fragment key={section.heading}>
                <h2 style={typeStyle(undefined, undefined, section.typeStyle, "heading")}>{section.heading}</h2>
                {section.blocks.map((block, index) => {
                  if (block.type === "button") {
                    return (
                      <p key={index}>
                        <button className="legal-consent-button" type="button" data-cookie-settings>{block.label}</button>
                      </p>
                    );
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={index}>
                        {block.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            {item.lead ? <strong>{item.lead}</strong> : null}
                            {item.lead ? " " : ""}
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={index} style={typeStyle(undefined, undefined, section.typeStyle, "body")}><Runs runs={block.runs} /></p>;
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
