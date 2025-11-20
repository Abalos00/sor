"use client";

import { FormEvent, UIEvent, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { registerSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast-provider";
import { termsSections, TERMS_VERSION } from "@/content/terms-of-service";

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

const extendedRegisterSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    termsAcceptedVersion: "",
  });
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 25 });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasReadTerms || !acceptTerms) {
      toast({
        title: "Acepta los terminos",
        description: "Debes leer y aceptar los terminos de servicio para continuar.",
        variant: "destructive",
      });
      return;
    }

    const parsed = extendedRegisterSchema.safeParse(formState);
    if (!parsed.success) {
      toast({
        title: "Revisa tus datos",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({
        title: "No pudimos crear la cuenta",
        description: data?.message ?? "Intenta nuevamente",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Cuenta creada", description: "Inicia sesion para continuar.", variant: "success" });
    router.push("/login?registered=1");
  };

  const openTermsModal = () => {
    setTermsScrolled(false);
    setTermsModalOpen(true);
  };

  const handleScrollTerms = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 20;
    if (reachedBottom) setTermsScrolled(true);
  };

  const confirmTermsReading = () => {
    setHasReadTerms(true);
    setTermsModalOpen(false);
    setFormState((prev) => ({ ...prev, termsAcceptedVersion: TERMS_VERSION }));
    setTimeout(() => {
      toast({
        title: "Gracias",
        description: "Confirmaste que leiste los terminos. Ahora puedes aceptarlos.",
        variant: "success",
      });
    }, 0);
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
          <div className="register-blob" />
          <div className="register-blob register-blob-delay" />
        </div>
        <div className="relative mx-auto w-full max-w-lg rounded-[32px] border border-white/15 bg-white/5 p-8 text-white shadow-2xl shadow-emerald-500/20 backdrop-blur-lg register-card">
          <div className="space-y-2 text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-emerald-300">
              SOR
            </p>
            <h1 className="text-3xl font-semibold text-white">Crear cuenta</h1>
            <p className="text-sm text-slate-300">
              Configura tu organizacion o perfil individual y lanza tus primeras instalaciones.
            </p>
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
              placeholder="tu@empresa.com"
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">
              Confirmar contrasena
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formState.confirmPassword}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="********"
                className="pr-12 bg-slate-900/40 text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-300 transition hover:text-white"
                aria-label={showConfirmPassword ? "Ocultar contrasena" : "Ver contrasena"}
              >
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200">
            <p className="text-slate-200">
              Antes de continuar debes leer y aceptar los{" "}
              <Link
                href="/support/terminos"
                className="font-semibold text-white underline"
                target="_blank"
                rel="noreferrer"
              >
                terminos de servicio
              </Link>
              . La plataforma solo distribuye herramientas oficiales y no incluye licencias. Estas deben ser
              adquiridas por el usuario final.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={openTermsModal}
              className="w-full border-white/30 bg-white/10 text-white transition hover:bg-white/20"
            >
              Leer terminos de servicio
            </Button>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <Checkbox
                checked={acceptTerms}
                disabled={!hasReadTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
              />
              Acepto los terminos (habilitado al confirmar lectura)
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || !acceptTerms}
            className="w-full bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-300">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-white underline">
            Inicia sesion
          </Link>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-slate-400">
          <span className="rounded-full border border-white/20 px-3 py-1">Perfiles ilimitados</span>
          <span className="rounded-full border border-white/20 px-3 py-1">Tiempo de inactividad 30 min</span>
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

      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-white shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                  Terminos
                </p>
                <h2 className="text-xl font-semibold text-white">Lee con atencion</h2>
              </div>
              <button className="text-sm text-slate-300 hover:text-white" onClick={() => setTermsModalOpen(false)}>
                Cerrar
              </button>
            </div>
            <div
              className="terms-scroll mt-4 max-h-72 space-y-6 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              onScroll={handleScrollTerms}
            >
              {termsSections.map((section) => (
                <section key={section.title} className="space-y-2">
                  <h3 className="font-semibold text-white">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-300">
              Debes desplazarte hasta el final para habilitar la confirmacion.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/30 bg-white/10 text-white transition hover:bg-white/20"
                onClick={() => setTermsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!termsScrolled}
                className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={confirmTermsReading}
              >
                Confirmo que lei todo
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
      <style jsx>{`
        .register-blob {
          position: absolute;
          width: 120%;
          height: 120%;
          left: -10%;
          top: -20%;
          background: radial-gradient(
            circle at var(--glow-x, 50%) var(--glow-y, 25%),
            rgba(59, 130, 246, 0.22),
            transparent 65%
          );
          filter: blur(120px);
          animation: registerFlow 22s ease-in-out infinite;
        }
        .register-blob-delay {
          animation-delay: -8s;
          background: radial-gradient(
            circle at calc(var(--glow-x, 50%) + 8%) calc(var(--glow-y, 25%) + 8%),
            rgba(16, 185, 129, 0.2),
            transparent 60%
          );
        }
        .register-card {
          animation: floatCard 16s ease-in-out infinite;
        }
        .terms-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(16, 185, 129, 0.5) transparent;
        }
        .terms-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .terms-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .terms-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.8), rgba(14, 165, 233, 0.6));
          border-radius: 999px;
        }
        .terms-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(16, 185, 129, 1), rgba(14, 165, 233, 0.9));
        }
        @keyframes registerFlow {
          0% {
            transform: translate(-10%, -5%) scale(1);
          }
          50% {
            transform: translate(8%, 6%) scale(1.05);
          }
          100% {
            transform: translate(-10%, -5%) scale(1);
          }
        }
        @keyframes floatCard {
          0%,
          100% {
            transform: translateY(0px);
            box-shadow: 0 30px 80px rgba(15, 23, 42, 0.25);
          }
          50% {
            transform: translateY(-8px);
            box-shadow: 0 40px 110px rgba(15, 23, 42, 0.35);
          }
        }
      `}</style>
    </>
  );
}

