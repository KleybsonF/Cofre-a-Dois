"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  initialData?: any;
  currentUser?: any;
  partnerUser?: any;
}

const EMOJIS = ['📦', '🛋️', '📺', '🧊', '🍳', '🚗', '💍', '🎮', '🛠️', '✈️', '🐶', '💰'];

export default function CreateBoxModal({ isOpen, onClose, goalId, initialData, currentUser, partnerUser }: CreateBoxModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [targetAmount, setTargetAmount] = useState("");
  const [isOpenValue, setIsOpenValue] = useState(false);
  const [ownerType, setOwnerType] = useState("SHARED");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name);
      setIcon(initialData.icon || "📦");
      setOwnerType(initialData.owner_type || "SHARED");
      if (initialData.target_amount === 0) {
        setIsOpenValue(true);
        setTargetAmount("");
      } else {
        setIsOpenValue(false);
        setTargetAmount(initialData.target_amount.toString());
      }
    } else if (isOpen) {
      setName("");
      setIcon("📦");
      setTargetAmount("");
      setIsOpenValue(false);
      setOwnerType("SHARED");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!isOpenValue && !targetAmount)) return;

    setIsLoading(true);
    try {
      const url = initialData ? `/api/boxes/${initialData.id}` : "/api/boxes";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          name,
          icon,
          owner_type: ownerType,
          target_amount: isOpenValue ? 0 : parseFloat(targetAmount)
        })
      });

      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar caixinha");
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
        background: "rgba(15, 15, 15, 0.95)",
        zIndex: 101
      }}>
        <button 
          onClick={onClose} 
          style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-main)", cursor: "pointer" }}
        >
          <X size={24} />
        </button>
        
        <h3 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>
          {initialData ? "Editar Caixinha" : "Nova Caixinha"}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Nome da Caixinha</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Ex: Sofá"
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
              <label style={{ fontSize: "0.9rem" }}>Meta (R$)</label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                <input 
                  type="checkbox" 
                  checked={isOpenValue}
                  onChange={(e) => setIsOpenValue(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                Valor em aberto
              </label>
            </div>
            {!isOpenValue && (
              <input 
                type="number" 
                step="0.01"
                min="1"
                className="glass-input" 
                placeholder="3000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required 
              />
            )}
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Tipo de Caixinha</label>
            <select 
              className="glass-input" 
              value={ownerType}
              onChange={(e) => setOwnerType(e.target.value)}
              style={{ padding: "12px", width: "100%", appearance: "none", cursor: "pointer", background: "rgba(15, 17, 21, 0.8)", color: "white" }}
            >
              <option value="SHARED">Compartilhada (ambos contribuem)</option>
              {currentUser && <option value={currentUser.id}>Individual - {currentUser.name}</option>}
              {partnerUser && <option value={partnerUser.id}>Individual - {partnerUser.name}</option>}
            </select>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Caixinhas individuais são visíveis para ambos, mas só o dono pode movimentar.
            </p>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: "16px" }} disabled={isLoading}>
            {isLoading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Criar caixinha")}
          </button>
        </form>
      </div>
    </div>
  );
}
