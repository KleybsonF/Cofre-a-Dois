"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: "100vh" }}>
      <div className="glass-panel" style={{ padding: "40px", width: "100%", maxWidth: "400px" }}>
        <div className="flex-center" style={{ marginBottom: "24px" }}>
          <Heart className="heart-pulsating" size={48} color="#ef4444" fill="#ef4444" />
        </div>
        
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Bem-vindo de volta</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "32px" }}>
          Acesse o seu banco conjunto
        </p>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>E-mail</label>
            <input 
              type="email" 
              className="glass-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ display: "block", fontSize: "0.9rem" }}>Senha</label>
              <Link href="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--user1-color)" }}>Esqueci a senha</Link>
            </div>
            <input 
              type="password" 
              className="glass-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: "16px" }} disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Não tem uma conta? <Link href="/register" style={{ color: "var(--user1-color)" }}>Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
