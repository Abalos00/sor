"use client";

import { FormEvent, useEffect, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";

type EyeIconProps = { open: boolean };

function EyeIcon({ open }: EyeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
    >
      {open ? (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6z"
          />
          <circle cx="12" cy="12" r="2.5" />
        </>
      ) : (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M7.5 7.5C4.5 9.3 2.25 12 2.25 12s3.75 6 9.75 6c1.65 0 3.18-.3 4.59-.82M16.5 16.5C19.5 14.7 21.75 12 21.75 12s-3.75-6-9.75-6c-.97 0-1.9.1-2.79.3"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75a3 3 0 004.5 4.5" />
        </>
      )}
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Contrasena requerida"),
  remember: z.boolean().default(false),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({ email: "admin@sor.local", password: "admin", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 45, y: 30 });

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (searchParams.get("registered") === "1") {
      toast({ title: "Cuenta creada", description: "Inicia sesion para continuar.", variant: "success" });
    } else if (reason === "session_required") {
      toast({ title: "Inicio requerido", description: "Por seguridad debes iniciar sesion nuevamente.", variant: "destructive" });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = loginSchema.safeParse(formState);
    if (!parsed.success) {
      toast({ title: "Revisa tus datos", description: parsed.error.issues[0].message });
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: parsed.data.email,
      password: parsed.data.password,
      remember: parsed.data.remember ? "1" : "0",
    });
    setLoading(false);

    if (result?.error) {
      toast({ title: "Credenciales invalidas", variant: "destructive" });
      return;
    }

    const rememberValue = parsed.data.remember ? "remember" : "session";
    const baseCookie = `sor_session=${rememberValue}; path=/; SameSite=Lax`;
    document.cookie = parsed.data.remember ? `${baseCookie}; Max-Age=${30 * 24 * 60 * 60}` : baseCookie;

    const summaryRes = await fetch("/api/me/summary");
    if (summaryRes.ok) {
      const summary = await summaryRes.json();
      const nextRoute = summary.profiles === 0 ? "/onboarding/profile" : "/dashboard";
      router.push(nextRoute);
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  };

  const handlePointerMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setGlowPosition({
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(5, Math.min(90, y)),
    });
  };

  const glowStyle = {
    "--glow-x": `${glowPosition.x}%`,
    "--glow-y": `${glowPosition.y}%`,
  } as CSSProperties;

  return (
    <>
      <div
        className="relative min-h-screen bg-slate-950 px-4 py-16"
        onMouseMove={handlePointerMove}
        style={glowStyle}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora-glow" />
          <div className="aurora-glow aurora-delay" />
        </div>
        <div className="relative mx-auto w-full max-w-md rounded-[32px] border border-white/15 bg-white/5 p-8 text-white shadow-2xl shadow-emerald-500/20 backdrop-blur-lg login-card">
          <div className="space-y-2 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-emerald-300">
              SOR
            </p>
            <h2 className="text-3xl font-semibold text-white">Iniciar sesion</h2>
          <p className="text-sm text-slate-400">Confirma identidad para acceder al dashboard.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="admin@sor.local"
              className="bg-slate-900/40 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Contrasena
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formState.password}
                onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="********"
                className="pr-12 bg-slate-900/40 text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-300 transition hover:text-white"
                aria-label={showPassword ? "Ocultar contrasena" : "Ver contrasena"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="remember" className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox
                id="remember"
                checked={formState.remember}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, remember: event.target.checked }))
                }
              />
              Recordarme
            </label>
            <Link href="/support" className="text-xs font-semibold text-slate-300 underline">
              Necesito ayuda
            </Link>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            {loading ? "Autenticando..." : "Ingresar"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-300">
          Sin cuenta?{" "}
          <Link href="/register" className="font-medium text-white underline">
            Registrate
          </Link>
        </p>
        <div className="mt-8 flex justify-center gap-4 text-xs text-slate-500">
          <span className="rounded-full border border-white/20 px-3 py-1 backdrop-blur">Sesiones cifradas</span>
          <span className="rounded-full border border-white/20 px-3 py-1 backdrop-blur">Timeout 30 min</span>
        </div>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="rounded-full border border-white/20 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-white/10"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
      </div>
      <style jsx>{`
        .aurora-glow {
          position: absolute;
          width: 160%;
          height: 160%;
          left: -30%;
          top: -40%;
          background: radial-gradient(
            circle at var(--glow-x, 50%) var(--glow-y, 30%),
            rgba(16, 185, 129, 0.25),
            transparent 55%
          );
          filter: blur(90px);
          animation: aurora 18s ease-in-out infinite;
        }
        .aurora-delay {
          animation-delay: -6s;
          background: radial-gradient(
            circle at calc(var(--glow-x, 50%) + 5%) calc(var(--glow-y, 30%) + 5%),
            rgba(14, 165, 233, 0.18),
            transparent 60%
          );
        }
        .login-card {
          animation: floatCard 14s ease-in-out infinite;
        }
        @keyframes aurora {
          0% {
            transform: translateX(-10%) translateY(0) scale(1);
          }
          50% {
            transform: translateX(10%) translateY(-5%) scale(1.05);
          }
          100% {
            transform: translateX(-10%) translateY(0) scale(1);
          }
        }
        @keyframes floatCard {
          0%,
          100% {
            transform: translateY(0px);
            box-shadow: 0 25px 70px rgba(15, 118, 110, 0.25);
          }
          50% {
            transform: translateY(-6px);
            box-shadow: 0 35px 90px rgba(16, 185, 129, 0.2);
          }
        }
      `}</style>
    </>
  );
}

