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

    const { name, icon, target_amount, coupleId } = await request.json();

    if (!name || target_amount === undefined || target_amount === null || !coupleId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        couple_id: coupleId,
        name,
        icon: icon || '🎯',
        target_amount: parseFloat(target_amount)
      }
    });

    return NextResponse.json({ goal }, { status: 201 });

  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
