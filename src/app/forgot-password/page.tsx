"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao alterar a senha.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: "100vh" }}>
      <div className="glass-panel" style={{ padding: "40px", width: "100%", maxWidth: "400px" }}>
        <div className="flex-center" style={{ marginBottom: "24px" }}>
          <Heart className="heart-pulsating" size={48} color="#ef4444" fill="#ef4444" />
        </div>
        
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Esqueci a Senha</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "32px" }}>
          Redefina sua senha abaixo
        </p>

        {success ? (
          <div style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
            Senha alterada com sucesso! Redirecionando para o login...
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "16px", textAlign: "center" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>E-mail cadastrado</label>
                <input 
                  type="email" 
                  className="glass-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Nova Senha</label>
                <input 
                  type="password" 
                  className="glass-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                />
              </div>
              
              <button type="submit" className="btn-primary" style={{ marginTop: "16px" }} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem" }}>
          <Link href="/login" style={{ color: "var(--text-secondary)" }}>Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}
