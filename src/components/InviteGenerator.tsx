"use client";

import { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";

export default function InviteGenerator({ coupleId }: { coupleId: string }) {
  const [inviteLink, setInviteLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupleId })
      });
      const data = await res.json();
      
      if (res.ok) {
        const link = `${window.location.origin}/invite/${data.token}`;
        setInviteLink(link);
      } else {
        alert(data.error || "Erro ao gerar convite");
      }
    } catch (e) {
      alert("Falha na conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteLink) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Envie este link para seu amor:</p>
        <div style={{ 
          display: "flex", 
          background: "rgba(255,255,255,0.05)", 
          borderRadius: "8px", 
          border: "1px solid var(--card-border)",
          overflow: "hidden"
        }}>
          <input 
            type="text" 
            value={inviteLink} 
            readOnly 
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "white", 
              padding: "8px 12px", 
              width: "100%",
              outline: "none",
              fontSize: "0.8rem"
            }} 
          />
          <button 
            onClick={copyToClipboard}
            style={{ 
              background: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.1)", 
              color: copied ? "#10b981" : "white",
              border: "none", 
              padding: "0 12px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {copied ? <Check size={16} /> : <LinkIcon size={16} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button className="btn-secondary" onClick={handleGenerate} disabled={isLoading} style={{ fontSize: "0.9rem", padding: "8px 16px" }}>
      {isLoading ? "Gerando..." : "Gerar link de convite"}
    </button>
  );
}
