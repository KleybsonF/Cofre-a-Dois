"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCoupleButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/couple", {
        method: "POST"
      });

      if (res.ok) {
        // Force refresh to reload the layout/server component
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar casal");
      }
    } catch (e) {
      alert("Falha na conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button className="btn-primary" onClick={handleCreate} disabled={isLoading}>
      {isLoading ? "Criando..." : "Criar Casal"}
    </button>
  );
}
