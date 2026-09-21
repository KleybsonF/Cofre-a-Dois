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

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const invite = await prisma.coupleInvite.findUnique({
      where: { token },
      include: { couple: true }
    });

    if (!invite || invite.expires_at < new Date()) {
      return NextResponse.json({ error: 'Convite inválido ou expirado' }, { status: 400 });
    }

    if (invite.couple.user_1_id === user.id) {
      return NextResponse.json({ error: 'Você não pode aceitar seu próprio convite' }, { status: 400 });
    }

    if (invite.couple.user_2_id) {
      return NextResponse.json({ error: 'Este casal já está completo' }, { status: 400 });
    }

    // Verificar se a pessoa já tem um casal vazio criado por engano
    const existingEmptyCouple = await prisma.couple.findFirst({
      where: {
        user_1_id: user.id,
        user_2_id: null
      }
    });

    if (existingEmptyCouple) {
      // Deletar o casal vazio para não conflitar
      await prisma.couple.delete({
        where: { id: existingEmptyCouple.id }
      });
    }

    // Atualizar casal
    await prisma.couple.update({
      where: { id: invite.couple_id },
      data: {
        user_2_id: user.id
      }
    });

    // Deletar o convite usado
    await prisma.coupleInvite.delete({
      where: { id: invite.id }
    });

    return NextResponse.json({ message: 'Convite aceito!' }, { status: 200 });

  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
