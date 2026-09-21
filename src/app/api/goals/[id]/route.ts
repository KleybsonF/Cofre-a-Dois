import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { name, icon, target_amount } = await request.json();

    if (!name || target_amount === undefined || target_amount === null) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        name,
        icon,
        target_amount: parseFloat(target_amount)
      }
    });

    return NextResponse.json({ goal }, { status: 200 });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar objetivo' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    await prisma.goal.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Objetivo excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir objetivo' }, { status: 500 });
  }
}
