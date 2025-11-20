"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const planDefinitions = [
  {
    name: "Free",
    monthly: 0,
    description: "Explora el catalogo, crea un perfil y automatiza tus primeros jobs sin costo.",
    bullet: ["2 dispositivos max", "1 perfil activo", "Demo interactiva", "Soporte comunidad"],
    tag: "Gratis",
  },
  {
    name: "Individual",
    monthly: 0.25,
    description: "Plan mas solicitado por freelancers o perfiles sin organizacion.",
    bullet: ["Hasta 5 dispositivos", "Catalogo completo", "Perfiles personales", "Soporte comunidad"],
    tag: "Popular",
    highlighted: true,
  },
  {
    name: "Starter",
    monthly: 0.75,
    description: "Pequenos equipos de TI que quieren modernizar su staging sin complejidad extra.",
    bullet: ["Hasta 25 dispositivos", "Perfiles ilimitados", "Reportes basicos", "Email support"],
  },
  {
    name: "Growth",
    monthly: 2,
    description: "Organizaciones en expansion que necesitan programar jobs e integraciones.",
    bullet: ["Hasta 100 dispositivos", "Jobs programados", "Integraciones webhook", "Soporte prioritario"],
  },
  {
    name: "Enterprise",
    customPrice: "A medida",
    description: "Infraestructuras masivas con SLAs dedicados y servicios profesionales.",
    bullet: ["Dispositivos ilimitados", "SLA dedicado", "Servicios profesionales", "Cuenta tecnica asignada"],
  },
];

type Billing = "monthly" | "annual";

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const plans = useMemo(() => {
    return planDefinitions.map((plan) => {
      if (typeof plan.monthly === "number") {
        if (billing === "monthly") {
          return { ...plan, priceLabel: `UF ${plan.monthly}`, note: "por mes" };
        }
        const annual = Math.round(plan.monthly * 12 * 0.8);
        return { ...plan, priceLabel: `UF ${annual}`, note: "anual (-20%)" };
      }
      return { ...plan, priceLabel: plan.customPrice ?? "", note: "segun alcance" };
    });
  }, [billing]);

  return (
    <section id="planes" className="border-y border-slate-800 bg-slate-950 py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 px-2 py-1 text-xs">
            <button
              className={`rounded-full px-4 py-1 font-semibold ${
                billing === "monthly" ? "bg-white text-slate-900" : "text-white/70"
              }`}
              onClick={() => setBilling("monthly")}
            >
              Mensual
            </button>
            <button
              className={`rounded-full px-4 py-1 font-semibold ${
                billing === "annual" ? "bg-white text-slate-900" : "text-white/70"
              }`}
              onClick={() => setBilling("annual")}
            >
              Anual (20% OFF)
            </button>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Planes y costos</p>
          <h2 className="text-3xl font-semibold">Planes para individuos y equipos sin sorpresas</h2>
          <p className="text-slate-300">
            Selecciona el plan ideal para tu base instalada. Puedes cambiar de mensual a anual cuando quieras.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => {
            const highlighted = plan.highlighted;
            const baseClasses = highlighted
              ? "bg-white text-slate-900 border-white shadow-2xl shadow-black/30"
              : "bg-slate-900/70 border-white/10 text-white";
            return (
              <div
                key={plan.name}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border p-6 transition duration-300 hover:-translate-y-2 ${baseClasses}`}
              >
                {plan.tag && (
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-400/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-lg">
                    {plan.tag}
                  </span>
                )}
                <div className="text-xs font-semibold uppercase tracking-[0.3em]">{plan.name}</div>
                <p className="mt-4 text-4xl font-semibold">{plan.priceLabel}</p>
                <p className="text-sm text-white/70">{plan.note}</p>
                <p className="mt-3 text-sm text-white/70">{plan.description}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {plan.bullet.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    highlighted ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {plan.name === "Enterprise" ? "Contactar ventas" : "Comenzar"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
