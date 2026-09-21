import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { boxId, goalId, amount, type, description } = body; // type = 'DEPOSIT' ou 'WITHDRAWAL'

    if ((!boxId && !goalId) || !amount || amount <= 0 || !type || !description) {
      return NextResponse.json({ error: 'Dados inválidos para a transação. A observação é obrigatória.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    if (boxId) {
      const box = await prisma.savingsBox.findUnique({
        where: { id: boxId },
        include: { transactions: true }
      });

      if (!box) return NextResponse.json({ error: 'Caixinha não encontrada' }, { status: 404 });

      if (type === 'WITHDRAWAL') {
        const currentBalance = box.transactions.reduce((acc, curr) => 
          acc + (curr.type === 'DEPOSIT' ? curr.amount : -curr.amount), 0
        );
        if (amount > currentBalance) return NextResponse.json({ error: 'Saldo insuficiente na caixinha' }, { status: 400 });
      }
    } else if (goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: { transactions: true }
      });

      if (!goal) return NextResponse.json({ error: 'Objetivo não encontrado' }, { status: 404 });

      if (type === 'WITHDRAWAL') {
        const currentBalance = goal.transactions.reduce((acc, curr) => 
          acc + (curr.type === 'DEPOSIT' ? curr.amount : -curr.amount), 0
        );
        if (amount > currentBalance) return NextResponse.json({ error: 'Saldo insuficiente no objetivo' }, { status: 400 });
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        box_id: boxId || null,
        goal_id: goalId || null,
        user_id: user.id,
        amount: parseFloat(amount),
        type,
        description: description || null
      }
    });

    return NextResponse.json({ transaction }, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Erro interno ao processar transação' }, { status: 500 });
  }
}
