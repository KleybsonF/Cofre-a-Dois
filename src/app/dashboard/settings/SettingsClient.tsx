"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function SettingsClient({ user }: { user: any }) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [primaryColor, setPrimaryColor] = useState(user.primary_color || "#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState(user.secondary_color || "#ec4899");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar, primary_color: primaryColor, secondary_color: secondaryColor }),
      });

      if (res.ok) {
        alert("Configurações salvas com sucesso!");
        router.refresh();
      } else {
        alert("Erro ao salvar configurações");
      }
    } catch (err) {
      alert("Falha de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <Link href="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
          <ArrowLeft size={24} />
        </Link>
        <h2 style={{ fontSize: "2rem" }}>Meu Perfil</h2>
      </div>

      <div className="glass-panel" style={{ padding: "32px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Nome de Exibição</label>
            <input 
              type="text" 
              className="glass-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Avatar (URL da Imagem ou Emoji)</label>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Cole o link de uma imagem ou digite um Emoji (Ex: 🐶, 👱‍♂️, 👩).
            </p>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="https://... ou 👱‍♂️"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Cor Principal</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: "40px", height: "40px", border: "none", borderRadius: "8px", cursor: "pointer", background: "none", padding: 0 }}
                />
                <span style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{primaryColor}</span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Cor Secundária</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input 
                  type="color" 
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{ width: "40px", height: "40px", border: "none", borderRadius: "8px", cursor: "pointer", background: "none", padding: 0 }}
                />
                <span style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{secondaryColor}</span>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid var(--card-border)", marginTop: "16px" }}>
            <p style={{ fontWeight: "bold", marginBottom: "16px" }}>Pré-visualização</p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ 
                width: "60px", height: "60px", borderRadius: "50%", 
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", overflow: "hidden"
              }}>
                {avatar && (avatar.startsWith('http') || avatar.startsWith('data:')) ? (
                  <img src={avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span>{avatar || name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{name}</p>
                <div style={{ width: "100px", height: "6px", background: primaryColor, borderRadius: "3px", marginTop: "4px" }}></div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "16px" }} disabled={isLoading}>
            <Save size={20} />
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
