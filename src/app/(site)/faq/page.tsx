import type { Metadata } from "next";
import { query } from "@/lib/db";
import "./faq.css";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Kasumigaseki Capital MENA — our businesses, projects, and how to reach us.",
  alternates: { canonical: "https://kasumigaseki.ae/faq/" },
};

export const dynamic = "force-dynamic";

type FaqRow = { id: number; question: string; answer: string; category: string | null };

export default async function FaqPage() {
  let faqs: FaqRow[] = [];
  try {
    faqs = await query<FaqRow>(
      `SELECT id, question, answer, category FROM faqs
       WHERE is_published = true
       ORDER BY sort_order ASC, id ASC`
    );
  } catch {
    // DB unavailable — render hero + contact fallback.
  }

  const categories = [...new Set(faqs.map((f) => f.category ?? "General"))];

  return (
    <>
      <section className="hero-band" style={{ "--hero-image": "url('/images/quality2.webp')" } as React.CSSProperties}>
        <div className="wrap">
          <h1>FAQ</h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 46 }}>
        <div className="wrap">
          <div className="head" style={{ maxWidth: "none" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,2.8vw,2.2rem)", color: "var(--ink)", maxWidth: "none" }}>
              Frequently Asked Questions
            </h2>
            <p>Everything about Kasumigaseki MENA — our businesses, projects, and how to work with us.</p>
          </div>

          {faqs.length === 0 ? (
            <p style={{ color: "var(--grey-5)", marginTop: 24 }}>
              Questions are being prepared — in the meantime, reach us at{" "}
              <a href="mailto:info.dubai@kasumigaseki.co.jp" style={{ fontWeight: 600, borderBottom: "1px solid var(--black)" }}>
                info.dubai@kasumigaseki.co.jp
              </a>
              .
            </p>
          ) : (
            categories.map((cat) => (
              <div key={cat} style={{ marginTop: 34 }}>
                {categories.length > 1 && <h3 style={{ fontSize: "1.1rem" }}>{cat}</h3>}
                <div className="faq-list">
                  {faqs
                    .filter((f) => (f.category ?? "General") === cat)
                    .map((f) => (
                      <details key={f.id} className="faq-item">
                        <summary>{f.question}</summary>
                        <div className="faq-answer">{f.answer}</div>
                      </details>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
