import type { Metadata } from "next";
import { query } from "@/lib/db";
import { getListingContent } from "@/lib/listing-content";
import ListingPageShell from "@/components/site/ListingPageShell";
import "./faq.css";

export const dynamic = "force-dynamic";

type FaqRow = { id: number; question: string; answer: string; category: string | null };

export async function generateMetadata(): Promise<Metadata> {
  const content = await getListingContent("faq");
  return {
    title: content.hero.title,
    description: content.intro,
    alternates: { canonical: "https://kasumigaseki.ae/faq/" },
  };
}

export default async function FaqPage() {
  const content = await getListingContent("faq");
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
    <ListingPageShell content={content}>
      {faqs.length === 0 ? (
        <p style={{ color: "var(--grey-5)", marginTop: 24 }}>{content.emptyMessage}</p>
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
    </ListingPageShell>
  );
}
