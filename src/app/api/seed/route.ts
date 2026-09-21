import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const existing = await prisma.user.findFirst();
    if (existing) {
      return NextResponse.json({ message: 'Database já foi populado.' });
    }

    const passwordHash = await bcrypt.hash('senha123', 10);

    const user1 = await prisma.user.create({
      data: {
        name: 'Kleybson',
        email: 'kleybson@example.com',
        password_hash: passwordHash,
        primary_color: '#3b82f6', // Azul
      }
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Roberta',
        email: 'roberta@example.com',
        password_hash: passwordHash,
        primary_color: '#ec4899', // Rosa
      }
    });

    const couple = await prisma.couple.create({
      data: {
        name: 'Kleybson & Roberta',
        user_1_id: user1.id,
        user_2_id: user2.id,
      }
    });

    const goal = await prisma.goal.create({
      data: {
        couple_id: couple.id,
        name: 'Casa Nova',
        icon: '🏠',
        target_amount: 50000,
      }
    });

    // Caixinhas
    const boxSofa = await prisma.savingsBox.create({ data: { goal_id: goal.id, name: 'Sofá', icon: '🛋️', target_amount: 3000 } });
    const boxGeladeira = await prisma.savingsBox.create({ data: { goal_id: goal.id, name: 'Geladeira', icon: '🧊', target_amount: 4500 } });
    const boxTV = await prisma.savingsBox.create({ data: { goal_id: goal.id, name: 'TV', icon: '📺', target_amount: 3500 } });
    const boxCozinha = await prisma.savingsBox.create({ data: { goal_id: goal.id, name: 'Cozinha', icon: '🍳', target_amount: 8000 } });

    // Movimentações - Geladeira (K: 1500, R: 1200)
    await prisma.transaction.create({ data: { box_id: boxGeladeira.id, user_id: user1.id, amount: 500, type: 'DEPOSIT' } });
    await prisma.transaction.create({ data: { box_id: boxGeladeira.id, user_id: user2.id, amount: 400, type: 'DEPOSIT' } });
    await prisma.transaction.create({ data: { box_id: boxGeladeira.id, user_id: user1.id, amount: 1000, type: 'DEPOSIT' } });
    await prisma.transaction.create({ data: { box_id: boxGeladeira.id, user_id: user2.id, amount: 800, type: 'DEPOSIT' } });

    // Outras Movimentações pra bater o saldo do exemplo
    await prisma.transaction.create({ data: { box_id: boxSofa.id, user_id: user1.id, amount: 1000, type: 'DEPOSIT' } });
    await prisma.transaction.create({ data: { box_id: boxSofa.id, user_id: user2.id, amount: 800, type: 'DEPOSIT' } });
    
    await prisma.transaction.create({ data: { box_id: boxCozinha.id, user_id: user1.id, amount: 2000, type: 'DEPOSIT' } });
    await prisma.transaction.create({ data: { box_id: boxCozinha.id, user_id: user2.id, amount: 2600, type: 'DEPOSIT' } });
    
    await prisma.transaction.create({ data: { box_id: boxTV.id, user_id: user1.id, amount: 500, type: 'DEPOSIT' } });
    await prisma.transaction.create({ data: { box_id: boxTV.id, user_id: user2.id, amount: 700, type: 'DEPOSIT' } });
    
    // Extra donations to hit the 8450 and 11320
    await prisma.transaction.create({ data: { box_id: boxCozinha.id, user_id: user1.id, amount: 3450, type: 'DEPOSIT' } });
    await prisma.transaction.create({ data: { box_id: boxCozinha.id, user_id: user2.id, amount: 6820, type: 'DEPOSIT' } });

    return NextResponse.json({ message: 'Seed concluído com sucesso. Contas criadas: kleybson@example.com / roberta@example.com (Senha: senha123)' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
