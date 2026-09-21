import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Heart } from "lucide-react";
import AcceptInviteButton from "./AcceptInviteButton";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getServerSession(authOptions);

  const invite = await prisma.coupleInvite.findUnique({
    where: { token: token },
    include: { couple: { include: { user_1: true } } }
  });

  if (!invite) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "24px" }}>
        <h2>Convite inválido ou expirado</h2>
        <Link href="/" className="btn-primary">Voltar ao Início</Link>
      </div>
    );
  }

  const coupleUser1 = invite.couple.user_1;

  if (!session) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="glass-panel" style={{ padding: "40px", width: "100%", maxWidth: "500px", textAlign: "center" }}>
          <Heart className="heart-pulsating" size={64} color="#ef4444" fill="#ef4444" style={{ margin: "0 auto 24px" }} />
          <h2>Você foi convidado(a)!</h2>
          <p style={{ margin: "16px 0", fontSize: "1.2rem" }}>
            <strong style={{ color: coupleUser1.primary_color || 'var(--user1-color)' }}>{coupleUser1.name}</strong> está te convidando para dividir o **Banco Digital do Casal**.
          </p>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
            Para aceitar, você precisa ter uma conta no sistema.
          </p>
          
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link href={`/login?callbackUrl=/invite/${token}`} className="btn-primary">Fazer Login</Link>
            <Link href={`/register?callbackUrl=/invite/${token}`} className="btn-secondary">Criar Conta</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ minHeight: "100vh" }}>
      <div className="glass-panel" style={{ padding: "40px", width: "100%", maxWidth: "500px", textAlign: "center" }}>
        <Heart className="heart-pulsating" size={64} color="#ef4444" fill="#ef4444" style={{ margin: "0 auto 24px" }} />
        <h2>Aceitar Convite?</h2>
        <p style={{ margin: "16px 0", fontSize: "1.2rem" }}>
          <strong style={{ color: coupleUser1.primary_color || 'var(--user1-color)' }}>{coupleUser1.name}</strong> está aguardando você!
        </p>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
          Ao aceitar, seu perfil será vinculado e vocês dividirão o mesmo painel.
        </p>
        
        <AcceptInviteButton token={token} />
      </div>
    </div>
  );
}
