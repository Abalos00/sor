"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onboardingProfileSchema } from "@/lib/validators";
import { Wizard } from "@/components/Wizard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast-provider";
import { createFirstProfile } from "@/app/(app)/onboarding/profile/actions";

type Tool = {
  id: string;
  name: string;
  type: string;
};

const wizardSteps = [
  { id: "datos", label: "Datos básicos" },
  { id: "herramientas", label: "Herramientas" },
  { id: "resumen", label: "Resumen" },
];

const recommendedByIndustry: Record<string, string[]> = {
  Escolar: ["edge", "libreoffice", "sumatra"],
  Empresa: ["edge", "libreoffice", "7zip", "vlc"],
  Laboratorio: ["edge", "7zip", "vlc"],
  Otro: [],
};

export function ProfileWizard({ tools }: { tools: Tool[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    industry: "Escolar",
    os: "windows",
    toolIds: new Set<string>(),
  });

  const toggleTool = (toolId: string) => {
    setFormState((prev) => {
      const next = new Set(prev.toolIds);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return { ...prev, toolIds: next };
    });
  };

  const nextStep = () => {
    if (step === 0 && formState.name.trim().length < 3) {
      toast({ title: "Completa el nombre del perfil" });
      return;
    }
    if (step === 1 && formState.toolIds.size === 0) {
      toast({ title: "Selecciona al menos una herramienta" });
      return;
    }
    setStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleRecommended = () => {
    const picks = recommendedByIndustry[formState.industry] ?? [];
    setFormState((prev) => ({ ...prev, toolIds: new Set(picks) }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: formState.name.trim(),
      industry: formState.industry,
      os: "windows" as const,
      toolIds: Array.from(formState.toolIds),
    };
    const parsed = onboardingProfileSchema.safeParse(payload);
    if (!parsed.success) {
      toast({ title: "Revisa el wizard", description: parsed.error.issues[0].message });
      return;
    }
    setLoading(true);
    try {
      await createFirstProfile(parsed.data);
      toast({ title: "Perfil creado", variant: "success" });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({ title: "No pudimos crear el perfil", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Onboarding</p>
        <h1 className="text-3xl font-semibold text-slate-900">Tu primer perfil de despliegue</h1>
        <p className="text-slate-500">
          Configura el perfil mínimo para poder crear jobs y automatizar instalaciones.
        </p>
      </div>

      <Wizard steps={wizardSteps} activeStep={step}>
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del perfil</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="PC Escolar básico"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Rubro</Label>
              <select
                id="industry"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                value={formState.industry}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, industry: e.target.value }))
                }
              >
                {["Escolar", "Empresa", "Laboratorio", "Otro"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Sistema operativo</Label>
              <Input value="windows" readOnly className="bg-slate-100" />
              <p className="text-xs text-slate-500">
                En esta versión solo soportamos Windows. Próximamente sumaremos macOS y Linux.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Selecciona herramientas recomendadas para {formState.industry}.
              </p>
              <Button type="button" variant="ghost" onClick={handleRecommended}>
                Usar recomendadas
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {tools.map((tool) => (
                <label
                  key={tool.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 shadow-sm"
                >
                  <Checkbox
                    checked={formState.toolIds.has(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tool.name}</p>
                    <p className="text-xs text-slate-500">Tipo: {tool.type}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Confirma los datos antes de crear tu primer perfil.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-900">Nombre: {formState.name || "—"}</p>
              <p>Rubro: {formState.industry}</p>
              <p>OS: {formState.os}</p>
              <p className="mt-3 font-medium text-slate-900">
                Herramientas seleccionadas ({formState.toolIds.size})
              </p>
              <ul className="list-disc pl-5 text-slate-600">
                {tools
                  .filter((tool) => formState.toolIds.has(tool.id))
                  .map((tool) => (
                    <li key={tool.id}>{tool.name}</li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Anterior
            </Button>
          )}
          {step < wizardSteps.length - 1 && (
            <Button type="button" onClick={nextStep} className="md:ml-auto">
              Siguiente
            </Button>
          )}
          {step === wizardSteps.length - 1 && (
            <Button type="button" onClick={handleSubmit} disabled={loading} className="md:ml-auto">
              {loading ? "Creando..." : "Confirmar y crear"}
            </Button>
          )}
        </div>
      </Wizard>
    </div>
  );
}

