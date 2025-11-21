import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";
import { AppShell } from "@/components/layout/AppShell";
import { AppSessionProvider } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SystemOnReady",
  description: "MVP para perfilar dispositivos y orquestar instalaciones",
  icons: {
    icon: "/favicon.svg",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const prerender = false;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <ToastProvider>
          <AppSessionProvider>
            <AppShell>{children}</AppShell>
          </AppSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
