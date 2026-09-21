import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se já existe
    const existingCouple = await prisma.couple.findFirst({
      where: {
        OR: [
          { user_1_id: user.id },
          { user_2_id: user.id }
        ]
      }
    });

    if (existingCouple) {
      return NextResponse.json({ error: 'Você já faz parte de um casal' }, { status: 400 });
    }

    const couple = await prisma.couple.create({
      data: {
        name: `${user.name} & Parceiro(a)`,
        user_1_id: user.id,
      }
    });

    return NextResponse.json({ couple }, { status: 201 });

  } catch (error) {
    console.error('Error creating couple:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
