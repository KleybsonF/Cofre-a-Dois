import Link from "next/link";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "24px" }}>
      <Heart className="heart-pulsating" size={80} color="#ef4444" fill="#ef4444" />
      <h1 style={{ fontSize: "3rem", textAlign: "center" }}>Banco Digital do Casal</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", maxWidth: "600px", textAlign: "center" }}>
        Gerencie as finanças e os objetivos juntos, sem perder a sua identidade individual.
      </p>
      
      <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
        <Link href="/login" className="btn-primary" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
          Entrar
        </Link>
        <Link href="/register" className="btn-secondary" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
          Criar Conta
        </Link>
      </div>

      <div style={{ marginTop: "64px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
        Dica: Acesse <a href="/api/seed" target="_blank" style={{ color: "var(--user1-color)", textDecoration: "underline" }}>/api/seed</a> para popular o banco com os dados de Kleybson e Roberta!
      </div>
    </div>
  );
}
