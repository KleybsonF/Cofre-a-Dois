"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        color: "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        padding: "8px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "8px",
        cursor: "pointer",
        border: "none"
      }}
      title="Sair"
      onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
      onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
    >
      <LogOut size={20} />
    </button>
  );
}
