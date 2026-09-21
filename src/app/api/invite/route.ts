import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { coupleId } = await request.json();

    if (!coupleId) {
      return NextResponse.json({ error: 'ID do casal obrigatório' }, { status: 400 });
    }

    // Gerar um token amigável (8 caracteres)
    const token = crypto.randomBytes(4).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    const invite = await prisma.coupleInvite.create({
      data: {
        couple_id: coupleId,
        token: token,
        expires_at: expiresAt
      }
    });

    return NextResponse.json({ token: invite.token }, { status: 201 });

  } catch (error) {
    console.error('Error generating invite:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
