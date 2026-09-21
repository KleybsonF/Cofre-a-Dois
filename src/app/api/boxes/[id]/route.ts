import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { name, icon, target_amount, owner_type } = await request.json();

    if (!name || target_amount === undefined || target_amount === null) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const box = await prisma.savingsBox.update({
      where: { id },
      data: {
        name,
        icon,
        owner_type,
        target_amount: parseFloat(target_amount)
      }
    });

    return NextResponse.json({ box }, { status: 200 });
  } catch (error) {
    console.error('Error updating box:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar caixinha' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    await prisma.savingsBox.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Caixinha excluída com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting box:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir caixinha' }, { status: 500 });
  }
}
