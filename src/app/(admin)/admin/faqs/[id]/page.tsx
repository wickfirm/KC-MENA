import FaqEditor from "./FaqEditor";
import { queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

type Faq = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_published: boolean;
};

async function getFaq(id: string): Promise<Faq | null> {
  try {
    return await queryOne<Faq>("SELECT id, question, answer, category, sort_order, is_published FROM faqs WHERE id = $1", [Number(id)]);
  } catch {
    return null;
  }
}

export default async function FaqEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const faq = isNew ? null : await getFaq(id);

  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 22 }}>{isNew ? "New Question" : "Edit Question"}</h1>
      {isNew || faq ? <FaqEditor faq={faq} /> : <div className="card">FAQ not found (or database unavailable).</div>}
    </>
  );
}
