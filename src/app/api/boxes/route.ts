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

    const { name, icon, target_amount, goalId, owner_type } = await request.json();

    if (!name || target_amount === undefined || target_amount === null || !goalId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const box = await prisma.savingsBox.create({
      data: {
        goal_id: goalId,
        name,
        icon: icon || '📦',
        target_amount: parseFloat(target_amount),
        owner_type: owner_type || "SHARED"
      }
    });

    return NextResponse.json({ box }, { status: 201 });

  } catch (error) {
    console.error('Error creating box:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
