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
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--grey-5)",
            marginBottom: 6,
          }}
        >
          Kasumigaseki Capital MENA
        </p>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 20 }}>CMS Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
