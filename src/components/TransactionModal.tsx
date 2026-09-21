"use client";

import { useState } from "react";
import { X, ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: any; // Ideally typed with SavingsBox
  currentUser: any;
}

export default function TransactionModal({ isOpen, onClose, box, currentUser }: TransactionModalProps) {
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen || !box) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      const url = editingTransactionId ? `/api/transactions/${editingTransactionId}` : "/api/transactions";
      const method = editingTransactionId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boxId: box.isGoalDirect ? null : box.id,
          goalId: box.isGoalDirect ? box.id : null,
          amount: parseFloat(amount),
          type,
          description: description.trim()
        })
      });

      if (res.ok) {
        router.refresh();
        setAmount("");
        setDescription("");
        setEditingTransactionId(null);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao processar transação");
      }
    } catch (err) {
      alert("Falha de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = (t: any) => {
    setEditingTransactionId(t.id);
    setType(t.type);
    setAmount(t.amount.toString());
    setDescription(t.description || "");
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta movimentação?")) return;
    
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
        if (editingTransactionId === id) {
          setEditingTransactionId(null);
          setAmount("");
          setDescription("");
        }
      } else {
        alert("Erro ao excluir transação");
      }
    } catch (err) {
      alert("Falha de conexão");
    }
  };

  const boxTotal = box.transactions.reduce((acc: number, curr: any) => 
    acc + (curr.type === 'DEPOSIT' ? curr.amount : -curr.amount), 0
  );

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "400px", padding: "32px", position: "relative" }}>
        <button 
          onClick={onClose} 
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-main)", cursor: "pointer" }}
        >
          <X size={24} />
        </button>
        
        <h3 style={{ fontSize: "1.5rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          {box.icon} {box.name}
        </h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Saldo atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(boxTotal)}
        </p>

        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <button 
            type="button"
            onClick={() => setType('DEPOSIT')}
            style={{
              flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid var(--card-border)",
              background: type === 'DEPOSIT' ? "rgba(16, 185, 129, 0.2)" : "transparent",
              color: type === 'DEPOSIT' ? "#10b981" : "var(--text-main)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <ArrowUpCircle size={20} /> Guardar
          </button>
          
          <button 
            type="button"
            onClick={() => setType('WITHDRAWAL')}
            style={{
              flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid var(--card-border)",
              background: type === 'WITHDRAWAL' ? "rgba(239, 68, 68, 0.2)" : "transparent",
              color: type === 'WITHDRAWAL' ? "#ef4444" : "var(--text-main)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <ArrowDownCircle size={20} /> Retirar
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Valor (R$)</label>
            <input 
              type="number" 
              step="0.01"
              min="0.01"
              className="glass-input" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Observação</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Ex: Salário, Bônus, Presente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required 
            />
          </div>
          
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
              {isLoading ? "Processando..." : (editingTransactionId ? "Salvar Alterações" : (type === 'DEPOSIT' ? "Adicionar dinheiro" : "Confirmar retirada"))}
            </button>
            {editingTransactionId && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { setEditingTransactionId(null); setAmount(""); setDescription(""); }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {box.transactions && box.transactions.length > 0 && (
          <div style={{ marginTop: "32px", borderTop: "1px solid var(--card-border)", paddingTop: "16px" }}>
            <h4 style={{ fontSize: "1rem", marginBottom: "16px", color: "var(--text-secondary)" }}>Histórico Recente</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "150px", overflowY: "auto", paddingRight: "8px" }}>
              {[...box.transactions].reverse().map((t: any) => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "8px" }}>
                  <div style={{ flex: 1, paddingRight: "8px" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: "bold", color: t.type === 'DEPOSIT' ? "#10b981" : "#ef4444" }}>
                      {t.type === 'DEPOSIT' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-main)", margin: "4px 0" }}>
                      {t.description || "Sem observação"}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {new Date(t.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <div style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "12px" }}>
                      {t.user_id === currentUser.id ? 'Você' : 'Parceiro(a)'}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" onClick={() => handleEditTransaction(t)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleDeleteTransaction(t.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
