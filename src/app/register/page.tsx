"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await res.json();
        setError(data.error || "Ocorreu um erro ao cadastrar");
      }
    } catch (err) {
      setError("Falha na conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: "100vh" }}>
      <div className="glass-panel" style={{ padding: "40px", width: "100%", maxWidth: "400px" }}>
        <div className="flex-center" style={{ marginBottom: "24px" }}>
          <Heart className="heart-pulsating" size={48} color="#ec4899" fill="#ec4899" />
        </div>
        
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Crie sua conta</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "32px" }}>
          O primeiro passo para o banco do casal
        </p>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Como podemos te chamar?</label>
            <input 
              type="text" 
              className="glass-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
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
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Senha</label>
            <input 
              type="password" 
              className="glass-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: "16px" }} disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Já tem uma conta? <Link href="/login" style={{ color: "var(--user2-color)" }}>Fazer login</Link>
        </div>
      </div>
    </div>
  );
}
