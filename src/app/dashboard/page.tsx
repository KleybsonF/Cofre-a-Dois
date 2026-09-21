import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import CreateCoupleButton from "@/components/CreateCoupleButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) return null;

  // Buscar usuário atual
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return null;

  // Buscar casal (prioriza casais completos onde user_2_id não é nulo)
  let couple = await prisma.couple.findFirst({
    where: {
      OR: [
        { user_1_id: user.id, user_2_id: { not: null } },
        { user_2_id: user.id }
      ]
    },
    include: {
      user_1: true,
      user_2: true,
      goals: {
        include: {
          transactions: true,
          boxes: {
            include: {
              transactions: true
            }
          }
        }
      }
    }
  });

  // Se não encontrou casal completo, tenta achar um vazio
  if (!couple) {
    couple = await prisma.couple.findFirst({
      where: {
        user_1_id: user.id,
        user_2_id: null
      },
      include: {
        user_1: true,
        user_2: true,
        goals: {
          include: {
            transactions: true,
            boxes: {
              include: {
                transactions: true
              }
            }
          }
        }
      }
    });
  }

  // Se não tem casal, retornar tela de convite/criar casal
  if (!couple) {
    return (
      <div className="container flex-center" style={{ minHeight: "60vh", flexDirection: "column", gap: "24px" }}>
        <h2 style={{ fontSize: "2rem" }}>Você ainda não faz parte de um casal</h2>
        <p style={{ color: "var(--text-secondary)" }}>Crie um casal para começar a gerenciar seus objetivos juntos.</p>
        <CreateCoupleButton />
      </div>
    );
  }

  // Garantir que o Lado Esquerdo (user1 no Client) seja SEMPRE o usuário logado
  const isUser1 = couple.user_1_id === user.id;
  
  const myUser = isUser1 ? couple.user_1 : couple.user_2;
  const partnerUser = isUser1 ? couple.user_2 : couple.user_1;

  let totalMe = 0;
  let totalPartner = 0;
  let globalTargetAmount = 0;
  
  const goals = couple.goals || [];
  
  goals.forEach((goal) => {
    globalTargetAmount += goal.target_amount;
    
    // Somar transações diretas do Objetivo
    goal.transactions?.forEach((t: any) => {
      if (t.type === 'DEPOSIT') {
        if (t.user_id === myUser?.id) totalMe += t.amount;
        if (t.user_id === partnerUser?.id) totalPartner += t.amount;
      } else if (t.type === 'WITHDRAWAL') {
        if (t.user_id === myUser?.id) totalMe -= t.amount;
        if (t.user_id === partnerUser?.id) totalPartner -= t.amount;
      }
    });

    // Somar transações das Caixinhas
    goal.boxes.forEach(box => {
      box.transactions.forEach(t => {
        if (t.type === 'DEPOSIT') {
          if (t.user_id === myUser?.id) totalMe += t.amount;
          if (t.user_id === partnerUser?.id) totalPartner += t.amount;
        } else if (t.type === 'WITHDRAWAL') {
          if (t.user_id === myUser?.id) totalMe -= t.amount;
          if (t.user_id === partnerUser?.id) totalPartner -= t.amount;
        }
      });
    });
  });

  const totalCouple = totalMe + totalPartner;
  const progressPercent = globalTargetAmount > 0 
    ? (totalCouple / globalTargetAmount) * 100 
    : 0;

  return (
    <DashboardClient 
      user1={myUser}
      user2={partnerUser}
      totalUser1={totalMe}
      totalUser2={totalPartner}
      totalCouple={totalCouple}
      goals={goals}
      globalTargetAmount={globalTargetAmount}
      progressPercent={progressPercent}
      currentUser={user}
      coupleId={couple.id}
    />
  );
}
