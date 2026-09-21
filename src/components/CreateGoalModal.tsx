"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupleId: string;
  initialData?: any;
}

const EMOJIS = ['🎯', '🏠', '🚗', '💍', '✈️', '🎓', '👶', '🎉', '🐶', '💼', '💰', '🎮'];

export default function CreateGoalModal({ isOpen, onClose, coupleId, initialData }: CreateGoalModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [targetAmount, setTargetAmount] = useState("");
  const [isOpenValue, setIsOpenValue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name);
      setIcon(initialData.icon || "🎯");
      if (initialData.target_amount === 0) {
        setIsOpenValue(true);
        setTargetAmount("");
      } else {
        setIsOpenValue(false);
        setTargetAmount(initialData.target_amount.toString());
      }
    } else if (isOpen) {
      setName("");
      setIcon("🎯");
      setTargetAmount("");
      setIsOpenValue(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!isOpenValue && !targetAmount)) return;

    setIsLoading(true);
    try {
      const url = initialData ? `/api/goals/${initialData.id}` : "/api/goals";
      const method = initialData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleId,
          name,
          icon,
          target_amount: isOpenValue ? 0 : parseFloat(targetAmount)
        })
      });

      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar objetivo");
      }
    } catch (err) {
      alert("Falha de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }}>
      <div className="glass-panel" style={{ 
        width: "100%", maxWidth: "450px", padding: "32px", position: "relative",
        background: "rgba(15, 15, 15, 0.95)", // Fundo escuro e quase sólido
        zIndex: 101
      }}>
        <button 
          onClick={onClose} 
          style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-main)", cursor: "pointer" }}
        >
          <X size={24} />
        </button>
        
        <h3 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>
          {initialData ? "Editar Objetivo Principal" : "Criar Objetivo Principal"}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Nome do Objetivo</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Ex: Casa Nova"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Ícone</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  style={{
                    fontSize: "1.5rem", padding: "8px", background: icon === emoji ? "rgba(255,255,255,0.1)" : "transparent",
                    border: icon === emoji ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                    borderRadius: "8px", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "0.9rem" }}>Meta Final (R$)</label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                <input 
                  type="checkbox" 
                  checked={isOpenValue}
                  onChange={(e) => setIsOpenValue(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                Deixar valor em aberto
              </label>
            </div>
            {!isOpenValue && (
              <input 
                type="number" 
                step="0.01"
                min="1"
                className="glass-input" 
                placeholder="50000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required 
              />
            )}
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: "8px", width: "100%" }} disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Objetivo"}
          </button>
        </form>
      </div>
    </div>
  );
}
