"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcceptInviteButton({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao aceitar convite");
      }
    } catch (e) {
      alert("Falha na conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button className="btn-primary" onClick={handleAccept} disabled={isLoading} style={{ width: "100%", maxWidth: "300px" }}>
      {isLoading ? "Processando..." : "Aceitar e Entrar"}
    </button>
  );
}
