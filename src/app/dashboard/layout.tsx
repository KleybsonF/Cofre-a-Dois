import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Settings, Heart } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Premium Glassmorphism */}
      <header style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 50, 
        background: "rgba(15, 17, 21, 0.7)", 
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--card-border)",
        padding: "16px 24px"
      }}>
        <div className="container dashboard-header-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 600 }}>
            <Heart size={24} color="#ef4444" fill="#ef4444" />
            <span>Banco do Casal</span>
          </div>
          
          <div className="dashboard-header-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Olá, {user?.name || session.user?.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "50%", 
                background: `linear-gradient(135deg, ${user?.primary_color || 'var(--user1-color)'}, ${user?.secondary_color || 'var(--user2-color)'})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1.2rem",
                boxShadow: `0 4px 12px ${user?.primary_color || 'rgba(59, 130, 246)'}66`,
                overflow: "hidden"
              }}>
                {user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span>{user?.avatar || (user?.name?.[0] || 'U').toUpperCase()}</span>
                )}
              </div>

              <Link href="/dashboard/settings" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} title="Configurações">
                <Settings size={20} />
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "32px 0" }}>
        {children}
      </main>
    </div>
  );
}
