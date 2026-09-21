"use client";

import { X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WealthEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: any[];
}

export default function WealthEvolutionModal({ isOpen, onClose, goals }: WealthEvolutionModalProps) {
  if (!isOpen) return null;

  // Extrair e ordenar todas as transações
  const allTransactions: any[] = [];
  
  goals?.forEach(goal => {
    goal.transactions?.forEach((t: any) => allTransactions.push(t));
    goal.boxes?.forEach((b: any) => {
      b.transactions?.forEach((t: any) => allTransactions.push(t));
    });
  });

  allTransactions.sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

  const monthlyData: Record<string, number> = {};
  let cumulative = 0;

  allTransactions.forEach(t => {
    const date = new Date(t.transaction_date);
    // Ex: "set. de 2026"
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
    
    if (t.type === 'DEPOSIT') cumulative += t.amount;
    else if (t.type === 'WITHDRAWAL') cumulative -= t.amount;
    
    monthlyData[monthYear] = cumulative;
  });

  let chartData = Object.keys(monthlyData).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalizar o mês
    value: monthlyData[key]
  }));

  if (chartData.length === 1) {
    chartData = [
      { name: 'Início', value: 0 },
      ...chartData
    ];
  } else if (chartData.length === 0) {
    chartData = [
      { name: 'Sem dados', value: 0 }
    ];
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: "rgba(15, 15, 15, 0.95)", 
          border: "1px solid var(--card-border)", 
          padding: "12px", 
          borderRadius: "8px" 
        }}>
          <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{label}</p>
          <p style={{ margin: 0, color: "#ef4444", fontWeight: "bold", fontSize: "1.1rem" }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
      background: "#0f0f11", // Fundo SÓLIDO e escuro
      display: "flex", flexDirection: "column", zIndex: 9999
    }}>
      <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#ef4444" }}>❤️</span> Evolução do Patrimônio
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
            Acompanhe o crescimento financeiro do casal
          </p>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "8px", borderRadius: "50%", cursor: "pointer" }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
          
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Patrimônio Total Atual</p>
            <h3 style={{ fontSize: "2rem", color: "white", fontWeight: "bold" }}>
              {formatCurrency(chartData[chartData.length - 1]?.value || 0)}
            </h3>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
