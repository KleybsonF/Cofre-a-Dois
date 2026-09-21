"use client";

import { useState } from "react";
import { Heart, X, PlusCircle, Pencil, Trash2 } from "lucide-react";
import InviteGenerator from "@/components/InviteGenerator";
import TransactionModal from "@/components/TransactionModal";
import CreateGoalModal from "@/components/CreateGoalModal";
import CreateBoxModal from "@/components/CreateBoxModal";
import WealthEvolutionModal from "@/components/WealthEvolutionModal";

export default function DashboardClient({
  user1,
  user2,
  totalUser1,
  totalUser2,
  totalCouple,
  goals,
  globalTargetAmount,
  progressPercent,
  currentUser,
  coupleId
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<any>(null);
  
  // Modais de Criação / Edição
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  
  const [isCreateBoxModalOpen, setIsCreateBoxModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<any>(null);
  const [selectedGoalIdForBox, setSelectedGoalIdForBox] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Tem certeza que deseja excluir este objetivo? TODAS as caixinhas e transações dele serão apagadas!")) return;
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      if (res.ok) window.location.reload();
      else alert("Erro ao excluir");
    } catch (e) { alert("Falha na conexão"); }
  };

  const handleDeleteBox = async (boxId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta caixinha e seu histórico?")) return;
    try {
      const res = await fetch(`/api/boxes/${boxId}`, { method: 'DELETE' });
      if (res.ok) window.location.reload();
      else alert("Erro ao excluir");
    } catch (e) { alert("Falha na conexão"); }
  };

  return (
    <div className="container" style={{ padding: "32px 16px" }}>
      
      {/* Triple Layout */}
      <div className="dashboard-grid">
        
        {/* Lado Esquerdo - User 1 */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", borderTop: `4px solid ${user1?.primary_color || 'var(--user1-color)'}` }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", backgroundColor: user1?.primary_color || "var(--card-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", color: "white", flexShrink: 0 }}>
            {user1?.avatar ? (
              <img src={user1.avatar} alt={user1.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              user1?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "4px", color: "var(--text-secondary)" }}>{user1?.name}</h3>
            <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: user1?.primary_color || 'var(--user1-color)' }}>
              {formatCurrency(totalUser1)}
            </p>
          </div>
        </div>

        {/* Centro - Coração */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div onClick={() => setIsModalOpen(true)} className="heart-pulsating" title="Ver resumo do casal">
            <Heart size={80} color="#ef4444" fill="#ef4444" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{formatCurrency(totalCouple)}</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Nosso Patrimônio</p>
          </div>
        </div>

        {/* Lado Direito - User 2 */}
        {user2 ? (
          <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", borderTop: `4px solid ${user2?.primary_color || 'var(--user2-color)'}` }}>
            <div style={{ textAlign: "right" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "4px", color: "var(--text-secondary)" }}>{user2?.name}</h3>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: user2?.primary_color || 'var(--user2-color)' }}>
                {formatCurrency(totalUser2)}
              </p>
            </div>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", backgroundColor: user2?.primary_color || "var(--card-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", color: "white", flexShrink: 0 }}>
              {user2?.avatar ? (
                <img src={user2.avatar} alt={user2.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user2?.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "32px", textAlign: "center", borderStyle: "dashed", borderColor: "var(--card-border)", borderWidth: "2px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>Aguardando parceiro(a)...</p>
            <InviteGenerator coupleId={coupleId} />
          </div>
        )}

      </div>

      <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
        <button className="btn-primary" onClick={() => setIsCreateGoalModalOpen(true)}>
          + Criar Novo Objetivo
        </button>
      </div>

      {/* Caixinhas (Sub-metas) - Mapeando todos os projetos */}
      {goals && goals.length > 0 ? (
        goals.map((goal: any) => {
          const directTotal = goal.transactions?.reduce((acc: number, curr: any) => 
            acc + (curr.type === 'DEPOSIT' ? curr.amount : -curr.amount), 0
          ) || 0;
          
          const boxesTotal = goal.boxes.reduce((accBox: number, box: any) => 
            accBox + box.transactions.reduce((acc: number, curr: any) => 
              acc + (curr.type === 'DEPOSIT' ? curr.amount : -curr.amount), 0
            ), 0
          );
          
          const goalTotalSaved = directTotal + boxesTotal;
          const goalTarget = goal.target_amount;
          const goalProgressPercent = goalTarget > 0 ? (goalTotalSaved / goalTarget) * 100 : 0;

          return (
            <div key={goal.id} style={{ marginTop: "64px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "1.5rem", margin: 0 }}>{goal.icon} {goal.name}</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setEditingGoal(goal); setIsCreateGoalModalOpen(true); }} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} title="Editar Projeto"><Pencil size={18} /></button>
                      <button onClick={() => handleDeleteGoal(goal.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="Excluir Projeto"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "4px" }}>
                    {formatCurrency(goalTotalSaved)} {goalTarget > 0 && <span style={{ color: "var(--text-secondary)", fontWeight: "normal" }}>/ {formatCurrency(goalTarget)} ({goalProgressPercent.toFixed(1)}%)</span>}
                  </div>
                  <div className="dashboard-header-inner" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", gap: "16px" }}>
                    <span>Fundo Geral: <strong>{formatCurrency(directTotal)}</strong></span>
                    <span>Total nas Caixinhas: <strong>{formatCurrency(boxesTotal)}</strong></span>
                  </div>
                </div>
                
                <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.9rem" }} onClick={() => { setSelectedGoalIdForBox(goal.id); setIsCreateBoxModalOpen(true); }}>
                  + Nova Caixinha
                </button>
              </div>
            <div className="boxes-grid">
              {/* Card de Fundo Geral do Objetivo */}
              {(() => {
                const directTotal = goal.transactions?.reduce((acc: number, curr: any) => 
                  acc + (curr.type === 'DEPOSIT' ? curr.amount : -curr.amount), 0
                ) || 0;

                const goalMockBox = {
                  id: goal.id,
                  name: "Fundo Geral",
                  icon: "🏦",
                  target_amount: 0, // Ou calcular baseado no target - caixinhas, mas manter 0 para não ter barra de progresso individual
                  transactions: goal.transactions || [],
                  owner_type: "SHARED",
                  isGoalDirect: true // Flag customizada caso precisemos no backend
                };

                return (
                  <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "16px", borderRadius: "16px", border: "1px dashed var(--card-border)", position: "relative" }}>
                    <h4 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>🏦 Fundo Geral</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "8px" }}>Dinheiro livre do projeto</p>
                    <p style={{ fontWeight: "bold", marginBottom: "16px" }}>{formatCurrency(directTotal)}</p>
                    
                    <button 
                      onClick={() => setSelectedBox(goalMockBox)}
                      className="btn-secondary"
                      style={{ width: "100%", padding: "8px", fontSize: "0.9rem", display: "flex", justifyContent: "center", gap: "8px", background: "rgba(59,130,246,0.2)" }}
                    >
                      <PlusCircle size={16} /> Movimentar
                    </button>
                  </div>
                );
              })()}

              {goal.boxes.map((box: any) => {
                const boxTotal = box.transactions.reduce((acc: number, curr: any) => 
                  acc + (curr.type === 'DEPOSIT' ? curr.amount : -curr.amount), 0
                );
                const boxProgress = box.target_amount > 0 ? (boxTotal / box.target_amount) * 100 : 0;
                
                return (
                  <div key={box.id} style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "16px", border: "1px solid var(--card-border)", position: "relative" }}>
                    <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>
                      <button onClick={() => { setEditingBox(box); setSelectedGoalIdForBox(goal.id); setIsCreateBoxModalOpen(true); }} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} title="Editar Caixinha"><Pencil size={16} /></button>
                      <button onClick={() => handleDeleteBox(box.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="Excluir Caixinha"><Trash2 size={16} /></button>
                    </div>

                    <h4 style={{ fontSize: "1.2rem", marginBottom: "8px", paddingRight: "48px" }}>
                      {box.icon} {box.name}
                      {box.owner_type !== "SHARED" && (
                        <span style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "8px", marginLeft: "8px", verticalAlign: "middle" }}>
                          Individual
                        </span>
                      )}
                    </h4>
                    
                    <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                      {formatCurrency(boxTotal)} 
                      {box.target_amount > 0 ? ` / ${formatCurrency(box.target_amount)}` : ''}
                    </p>
                    
                    {box.target_amount > 0 && (
                      <div style={{ background: "rgba(255,255,255,0.1)", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
                        <div style={{ background: "var(--text-main)", height: "100%", width: `${Math.min(boxProgress, 100)}%` }} />
                      </div>
                    )}

                    {box.owner_type !== "SHARED" && box.owner_type !== currentUser.id ? (
                      <button 
                        disabled
                        className="btn-secondary"
                        style={{ width: "100%", padding: "8px", fontSize: "0.9rem", display: "flex", justifyContent: "center", gap: "8px", opacity: 0.5, cursor: "not-allowed" }}
                      >
                        🔒 Somente o dono pode movimentar
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedBox(box)}
                        className="btn-secondary"
                        style={{ width: "100%", padding: "8px", fontSize: "0.9rem", display: "flex", justifyContent: "center", gap: "8px" }}
                      >
                        <PlusCircle size={16} /> Movimentar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })
      ) : (
        <div style={{ marginTop: "64px", textAlign: "center", padding: "40px", border: "1px dashed var(--card-border)", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-secondary)" }}>Nenhum Objetivo Definido</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Vocês ainda não criaram nenhum objetivo. Comecem criando o primeiro!</p>
          <button className="btn-primary" onClick={() => setIsCreateGoalModalOpen(true)}>
            Criar Nosso Primeiro Objetivo
          </button>
        </div>
      )}

      <WealthEvolutionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        goals={goals} 
      />

      {/* Modal de Transação */}
      <TransactionModal 
        isOpen={!!selectedBox} 
        onClose={() => setSelectedBox(null)} 
        box={selectedBox} 
        currentUser={currentUser}
      />

      {/* Modais de Criação e Edição */}
      <CreateGoalModal 
        isOpen={isCreateGoalModalOpen} 
        onClose={() => { setIsCreateGoalModalOpen(false); setEditingGoal(null); }} 
        coupleId={coupleId}
        initialData={editingGoal}
      />

      <CreateBoxModal 
        isOpen={isCreateBoxModalOpen} 
        onClose={() => { setIsCreateBoxModalOpen(false); setEditingBox(null); setSelectedGoalIdForBox(null); }} 
        goalId={selectedGoalIdForBox || ''}
        initialData={editingBox}
        currentUser={currentUser}
        partnerUser={user1?.id === currentUser.id ? user2 : user1}
      />
    </div>
  );
}
