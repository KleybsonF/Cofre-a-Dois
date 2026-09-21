"use client";

import { X, Crown, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WealthEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: any[];
  user1: any;
  user2: any;
  totalUser1: number;
  totalUser2: number;
}

export default function WealthEvolutionModal({ isOpen, onClose, goals, user1, user2, totalUser1, totalUser2 }: WealthEvolutionModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // Extrair e ordenar todas as transações
  const allTransactions: any[] = [];
  
  goals?.forEach(goal => {
    goal.transactions?.forEach((t: any) => allTransactions.push(t));
    goal.boxes?.forEach((b: any) => {
      b.transactions?.forEach((t: any) => allTransactions.push(t));
    });
  });

  allTransactions.sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

  // Estatísticas Gamificadas
  let maxDepositUser1 = 0;
  let maxDepositUser2 = 0;
  let maxWithdrawalUser1 = 0;
  let maxWithdrawalUser2 = 0;
  let countUser1 = 0;
  let countUser2 = 0;

  const monthlyData: Record<string, { u1: number, u2: number }> = {};
  let cumU1 = 0;
  let cumU2 = 0;

  allTransactions.forEach(t => {
    const date = new Date(t.transaction_date);
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
    
    const isUser1 = t.user_id === user1?.id;
    const isUser2 = t.user_id === user2?.id;

    if (isUser1) countUser1++;
    if (isUser2) countUser2++;

    if (t.type === 'DEPOSIT') {
      if (isUser1) {
        cumU1 += t.amount;
        if (t.amount > maxDepositUser1) maxDepositUser1 = t.amount;
      }
      if (isUser2) {
        cumU2 += t.amount;
        if (t.amount > maxDepositUser2) maxDepositUser2 = t.amount;
      }
    } else if (t.type === 'WITHDRAWAL') {
      if (isUser1) {
        cumU1 -= t.amount;
        if (t.amount > maxWithdrawalUser1) maxWithdrawalUser1 = t.amount;
      }
      if (isUser2) {
        cumU2 -= t.amount;
        if (t.amount > maxWithdrawalUser2) maxWithdrawalUser2 = t.amount;
      }
    }
    
    monthlyData[monthYear] = { u1: cumU1, u2: cumU2 };
  });

  const u1Name = user1?.name || "Usuário 1";
  const u2Name = user2?.name || "Usuário 2";
  const u1Color = user1?.primary_color || "#3b82f6";
  const u2Color = user2?.primary_color || "#ec4899";

  let chartData = Object.keys(monthlyData).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    [u1Name]: monthlyData[key].u1,
    [u2Name]: monthlyData[key].u2,
  }));

  if (chartData.length === 1) {
    chartData = [
      { name: 'Início', [u1Name]: 0, [u2Name]: 0 },
      ...chartData
    ];
  } else if (chartData.length === 0) {
    chartData = [
      { name: 'Início', [u1Name]: 0, [u2Name]: 0 }
    ];
  }

  // Determinar vencedores das categorias
  const biggestDepositor = maxDepositUser1 > maxDepositUser2 ? user1 : maxDepositUser2 > maxDepositUser1 ? user2 : null;
  const biggestSpender = maxWithdrawalUser1 > maxWithdrawalUser2 ? user1 : maxWithdrawalUser2 > maxWithdrawalUser1 ? user2 : null;
  const mostActive = countUser1 > countUser2 ? user1 : countUser2 > countUser1 ? user2 : null;

  // Barra de Batalha (1v1)
  const totalBoth = totalUser1 + totalUser2;
  const pct1 = totalBoth > 0 ? (totalUser1 / totalBoth) * 100 : 50;
  const pct2 = totalBoth > 0 ? (totalUser2 / totalBoth) * 100 : 50;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "rgba(15,15,17,0.9)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px", borderRadius: "12px", backdropFilter: "blur(4px)" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "8px", fontSize: "0.85rem" }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, fontWeight: "bold", fontSize: "1.1rem", display: "flex", gap: "8px" }}>
              <span>{entry.name}:</span>
              <span>{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{ 
        width: "95%", maxWidth: "800px", maxHeight: "90vh",
        background: "#0f0f11", // Fundo SÓLIDO e escuro
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        display: "flex", flexDirection: "column", position: "relative",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        overflowY: "auto"
      }}>
        {/* HEADER */}
        <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#ef4444" }}>⚔️</span> Arena do Casal
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
              Acompanhe quem está liderando a poupança
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px", borderRadius: "50%", cursor: "pointer" }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* BARRA DE RIVALIDADE 1V1 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", textAlign: "center", marginBottom: "24px" }}>A Corrida do Patrimônio</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                {pct1 >= pct2 && <Crown size={24} color="#fbbf24" />}
                <div>
                  <p style={{ fontWeight: "bold", fontSize: "1.2rem", color: u1Color }}>{u1Name}</p>
                  <p style={{ color: "var(--text-secondary)" }}>{pct1.toFixed(1)}%</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                {pct2 > pct1 && <Crown size={24} color="#fbbf24" />}
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: "bold", fontSize: "1.2rem", color: u2Color }}>{u2Name}</p>
                  <p style={{ color: "var(--text-secondary)" }}>{pct2.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", width: "100%", height: "32px", borderRadius: "16px", overflow: "hidden", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
              <div style={{ width: `${pct1}%`, backgroundColor: u1Color, transition: "width 1s ease", display: "flex", alignItems: "center", paddingLeft: "12px", fontWeight: "bold" }}>
                {pct1 > 10 && formatCurrency(totalUser1)}
              </div>
              <div style={{ width: `${pct2}%`, backgroundColor: u2Color, transition: "width 1s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "12px", fontWeight: "bold" }}>
                {pct2 > 10 && formatCurrency(totalUser2)}
              </div>
            </div>
          </div>

          {/* ESTATÍSTICAS (CARDS) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <TrendingUp size={32} color="#10b981" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Maior Aporte Único</p>
              {biggestDepositor ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: biggestDepositor.primary_color }}>{biggestDepositor.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{formatCurrency(biggestDepositor.id === user1?.id ? maxDepositUser1 : maxDepositUser2)}</p>
                </>
              ) : <p>Empate</p>}
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Activity size={32} color="#3b82f6" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Formiga Trabalhadora</p>
              {mostActive ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: mostActive.primary_color }}>{mostActive.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{mostActive.id === user1?.id ? countUser1 : countUser2} transações</p>
                </>
              ) : <p>Empate</p>}
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <TrendingDown size={32} color="#ef4444" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Mão Aberta (Saca mais)</p>
              {biggestSpender ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: biggestSpender.primary_color }}>{biggestSpender.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{formatCurrency(biggestSpender.id === user1?.id ? maxWithdrawalUser1 : maxWithdrawalUser2)}</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Nenhum saque ainda</p>}
            </div>
          </div>

          {/* GRÁFICO DUPLO */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", height: "350px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "24px", textAlign: "center" }}>Acúmulo ao Longo do Tempo</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorU1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={u1Color} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={u1Color} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorU2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={u2Color} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={u2Color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  
                  <Area 
                    type="monotone" 
                    dataKey={u1Name} 
                    stroke={u1Color} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorU1)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={u2Name} 
                    stroke={u2Color} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorU2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
