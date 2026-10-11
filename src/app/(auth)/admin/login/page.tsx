import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        padding: "20px",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo%20kme%20dark.png" alt="Kasumigaseki Capital MENA" width={220} style={{ display: "block", margin: "0 0 18px -8px", maxWidth: "100%", height: "auto" }} />
        <p
          style={{
            fontSize: "0.68rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--grey-5)",
            marginBottom: 6,
          }}
        >
          Content management
        </p>
        <h1 style={{ fontSize: "1.6rem", marginBottom: 20, fontFamily: "var(--font-noto, 'Noto Serif'), serif", fontWeight: 600 }}>Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
