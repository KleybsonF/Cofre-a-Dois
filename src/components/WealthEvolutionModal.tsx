"use client";

import { X, Crown, TrendingUp, TrendingDown, Activity, Calendar, Lock, Clock, Target, Briefcase, Landmark } from "lucide-react";
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

  // Estatísticas Gamificadas originais
  let maxDepositUser1 = 0;
  let maxDepositUser2 = 0;
  let maxWithdrawalUser1 = 0;
  let maxWithdrawalUser2 = 0;
  let countUser1 = 0;
  let countUser2 = 0;

  // Novas estatísticas
  let currentMonthDepositUser1 = 0;
  let currentMonthDepositUser2 = 0;
  let totalWithdrawalUser1 = 0;
  let totalWithdrawalUser2 = 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyData: Record<string, { u1: number, u2: number }> = {};
  let cumU1 = 0;
  let cumU2 = 0;

  let lastToDepositUser: any = null;

  allTransactions.forEach(t => {
    const date = new Date(t.transaction_date);
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
    const isCurrentMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    
    const isUser1 = t.user_id === user1?.id;
    const isUser2 = t.user_id === user2?.id;

    if (isUser1) countUser1++;
    if (isUser2) countUser2++;

    if (t.type === 'DEPOSIT') {
      if (isUser1) {
        cumU1 += t.amount;
        if (t.amount > maxDepositUser1) maxDepositUser1 = t.amount;
        if (isCurrentMonth) currentMonthDepositUser1 += t.amount;
        lastToDepositUser = user1;
      }
      if (isUser2) {
        cumU2 += t.amount;
        if (t.amount > maxDepositUser2) maxDepositUser2 = t.amount;
        if (isCurrentMonth) currentMonthDepositUser2 += t.amount;
        lastToDepositUser = user2;
      }
    } else if (t.type === 'WITHDRAWAL') {
      if (isUser1) {
        cumU1 -= t.amount;
        totalWithdrawalUser1 += t.amount;
        if (t.amount > maxWithdrawalUser1) maxWithdrawalUser1 = t.amount;
      }
      if (isUser2) {
        cumU2 -= t.amount;
        totalWithdrawalUser2 += t.amount;
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
  
  const monthMVP = currentMonthDepositUser1 > currentMonthDepositUser2 ? user1 : currentMonthDepositUser2 > currentMonthDepositUser1 ? user2 : null;
  const stingyUser = totalWithdrawalUser1 < totalWithdrawalUser2 ? user1 : totalWithdrawalUser2 < totalWithdrawalUser1 ? user2 : null;
  const theBoss = totalUser1 > totalUser2 ? user1 : totalUser2 > totalUser1 ? user2 : null;

  // Lógica para Acionista Majoritário e Ambicioso
  let maxBalanceInSingleEntityUser1 = 0;
  let maxBalanceInSingleEntityUser2 = 0;
  
  let highestTarget = 0;
  let ambitiousU1 = 0;
  let ambitiousU2 = 0;

  goals?.forEach(goal => {
    // Balanço da Meta Geral
    let gU1 = 0; let gU2 = 0;
    goal.transactions?.forEach((t:any) => {
       if (t.user_id === user1?.id) { if (t.type === 'DEPOSIT') gU1 += t.amount; else gU1 -= t.amount; }
       if (t.user_id === user2?.id) { if (t.type === 'DEPOSIT') gU2 += t.amount; else gU2 -= t.amount; }
    });
    if (gU1 > maxBalanceInSingleEntityUser1) maxBalanceInSingleEntityUser1 = gU1;
    if (gU2 > maxBalanceInSingleEntityUser2) maxBalanceInSingleEntityUser2 = gU2;

    if (goal.target_amount > highestTarget) {
      highestTarget = goal.target_amount;
      ambitiousU1 = gU1; // simplificando pra usar o balanço atual em vez de só deposito
      ambitiousU2 = gU2;
    }

    // Balanço das Caixinhas Individuais
    goal.boxes?.forEach((b:any) => {
       let bU1 = 0; let bU2 = 0;
       b.transactions?.forEach((t:any) => {
         if (t.user_id === user1?.id) { if (t.type === 'DEPOSIT') bU1 += t.amount; else bU1 -= t.amount; }
         if (t.user_id === user2?.id) { if (t.type === 'DEPOSIT') bU2 += t.amount; else bU2 -= t.amount; }
       });
       if (bU1 > maxBalanceInSingleEntityUser1) maxBalanceInSingleEntityUser1 = bU1;
       if (bU2 > maxBalanceInSingleEntityUser2) maxBalanceInSingleEntityUser2 = bU2;

       if (b.target_amount > highestTarget) {
         highestTarget = b.target_amount;
         ambitiousU1 = bU1;
         ambitiousU2 = bU2;
       }
    });
  });

  const majorityShareholder = maxBalanceInSingleEntityUser1 > maxBalanceInSingleEntityUser2 ? user1 : maxBalanceInSingleEntityUser2 > maxBalanceInSingleEntityUser1 ? user2 : null;
  const ambitiousUser = ambitiousU1 > ambitiousU2 ? user1 : ambitiousU2 > ambitiousU1 ? user2 : null;

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
            
            {/* O Patrão */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: "linear-gradient(90deg, #10b981, #059669)" }} />
              <Briefcase size={32} color="#10b981" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>O Patrão (Maior Saldo)</p>
              {theBoss ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: theBoss.primary_color }}>{theBoss.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{formatCurrency(theBoss.id === user1?.id ? totalUser1 : totalUser2)} no total</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Empate de saldos</p>}
            </div>

            {/* Acionista Majoritário */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Landmark size={32} color="#3b82f6" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Acionista Majoritário</p>
              {majorityShareholder ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: majorityShareholder.primary_color }}>{majorityShareholder.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{formatCurrency(majorityShareholder.id === user1?.id ? maxBalanceInSingleEntityUser1 : maxBalanceInSingleEntityUser2)} em 1 caixa</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Sem fundos</p>}
            </div>

            {/* O Ambicioso */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Target size={32} color="#f43f5e" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>O Ambicioso</p>
              {ambitiousUser ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: ambitiousUser.primary_color }}>{ambitiousUser.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--text-secondary)" }}>focou no alvo de {formatCurrency(highestTarget)}</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Nenhuma meta com alvo</p>}
            </div>
            
            {/* Maior Aporte Único */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <TrendingUp size={32} color="#10b981" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Maior Aporte Único</p>
              {biggestDepositor ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: biggestDepositor.primary_color }}>{biggestDepositor.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{formatCurrency(biggestDepositor.id === user1?.id ? maxDepositUser1 : maxDepositUser2)}</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Nenhum depósito</p>}
            </div>

            {/* Destaque do Mês */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }} />
              <Calendar size={32} color="#fbbf24" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Destaque do Mês (Acelerado)</p>
              {monthMVP ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: monthMVP.primary_color }}>{monthMVP.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{formatCurrency(monthMVP.id === user1?.id ? currentMonthDepositUser1 : currentMonthDepositUser2)}</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Nenhum depósito no mês</p>}
            </div>

            {/* Formiga Trabalhadora */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Activity size={32} color="#3b82f6" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Formiga Trabalhadora</p>
              {mostActive ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: mostActive.primary_color }}>{mostActive.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{mostActive.id === user1?.id ? countUser1 : countUser2} transações</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Sem transações</p>}
            </div>

            {/* Último a Guardar */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Clock size={32} color="#a855f7" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>O Último a Guardar</p>
              {lastToDepositUser ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: lastToDepositUser.primary_color }}>{lastToDepositUser.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--text-secondary)" }}>foi a última pessoa</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Nenhum depósito</p>}
            </div>

            {/* Mão de Vaca */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Lock size={32} color="#f97316" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Mão de Vaca (Saca menos)</p>
              {stingyUser ? (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: stingyUser.primary_color }}>{stingyUser.name}</h4>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{formatCurrency(stingyUser.id === user1?.id ? totalWithdrawalUser1 : totalWithdrawalUser2)} sacados</p>
                </>
              ) : <p style={{ color: "var(--text-secondary)" }}>Nenhum saque ainda</p>}
            </div>

            {/* Mão Aberta */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <TrendingDown size={32} color="#ef4444" style={{ marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>Mão Aberta (Maior Saque)</p>
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
