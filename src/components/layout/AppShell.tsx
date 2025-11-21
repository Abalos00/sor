"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { UserInfoPanel } from "@/components/layout/UserInfoPanel";
import { LandingNav } from "@/components/layout/LandingNav";
import { SessionIdleGuard } from "@/components/layout/SessionIdleGuard";
import { SupportChatWidget } from "@/components/ui/SupportChatWidget";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/profiles", label: "Perfiles" },
  { href: "/dashboard/jobs", label: "Jobs" },
  { href: "/dashboard/devices", label: "Dispositivos" },
  { href: "/dashboard/users", label: "Usuarios" },
  { href: "/dashboard/reports", label: "Reportes" },
  { href: "/support", label: "Tutoriales & FAQ" },
  { href: "/support/tickets", label: "Tickets" },
];

const landingLinks = [
  { href: "/#caracteristicas", label: "Caracteristicas" },
  { href: "/#servicios", label: "Servicio" },
  { href: "/#planes", label: "Planes" },
  { href: "/#faq", label: "FAQ" },
  { href: "/support/tickets", label: "Tickets" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLanding = pathname === "/";
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");
  const [panelOpen, setPanelOpen] = useState(false);

  const togglePanel = () => setPanelOpen((prev) => !prev);

  const clearSessionCookie = () => {
    document.cookie = "sor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  };

  const handleSignOut = () => {
    clearSessionCookie();
    signOut({ callbackUrl: "/login" });
  };

  if (!isAuthenticated || isLanding) {
    if (isAuthPage) {
      return <main>{children}</main>;
    }
    return (
      <>
        <LandingNav links={landingLinks} showAnchors={isLanding} isAuthenticated={isAuthenticated} />
        <main>{children}</main>
        <SupportChatWidget />
      </>
    );
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold text-slate-900">
            SOR
          </Link>
          <nav className="hidden gap-4 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname?.startsWith(link.href)
                    ? "text-slate-900 underline underline-offset-4"
                    : "hover:text-slate-900"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              onClick={togglePanel}
            >
              Mi cuenta
            </button>
            <button
              className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 md:inline-flex"
              onClick={handleSignOut}
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <SupportChatWidget />
      {isAuthenticated && (
        <>
          <SessionIdleGuard onTimeout={handleSignOut} />
          <UserInfoPanel open={panelOpen} onClose={() => setPanelOpen(false)} onLogout={handleSignOut} />
        </>
      )}
    </>
  );
}
