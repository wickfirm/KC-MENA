import Link from "next/link";

/** Placeholder for sections whose admin screens arrive in Phase 2/3. */
export default function ComingSoon({ title, phase, bullets }: { title: string; phase: string; bullets: string[] }) {
  return (
    <>
      <h1 style={{ fontSize: "1.6rem", marginBottom: 4 }}>{title}</h1>
      <p style={{ color: "var(--grey-5)", marginBottom: 24 }}>Scheduled for {phase} of the engagement.</p>
      <div className="card" style={{ maxWidth: 640 }}>
        <p style={{ fontWeight: 700, marginBottom: 10 }}>Planned capabilities</p>
        <ul style={{ paddingLeft: 20, display: "grid", gap: 6 }}>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p style={{ marginTop: 18 }}>
          <Link href="/admin" style={{ textDecoration: "underline", fontWeight: 600 }}>← Back to dashboard</Link>
        </p>
      </div>
    </>
  );
}
