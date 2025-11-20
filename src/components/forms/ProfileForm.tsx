"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { profileSchema } from "@/lib/validators";
import { useToast } from "@/components/ui/toast-provider";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type Tool = {
  id: string;
  name: string;
  type: string;
  os: string;
  installer: string | null;
};

type ProfileFormProps = {
  mode: "create" | "edit";
  profileId?: string;
  initialValues?: {
    name: string;
    industry: string;
    os: string;
    toolIds: string[];
    wallpaper?: { url: string | null; locked: boolean };
  };
  tools: Tool[];
};

const industries = ["Escolar", "Empresa", "Laboratorio", "Otro"] as const;
const operatingSystems = ["windows", "macos", "linux"] as const;

const TOOL_GUIDE: Record<string, { category: string; hint: string }> = {
  edge: { category: "Navegadores", hint: "Exploradores modernos para usuarios finales." },
  brave: { category: "Navegadores", hint: "Navegadores reforzados con privacidad extra." },
  libreoffice: { category: "Ofimática", hint: "Suites de documentos gratuitas." },
  excel: { category: "Microsoft 365", hint: "Parte de la suite Office." },
  word: { category: "Microsoft 365", hint: "Parte de la suite Office." },
  powerpoint: { category: "Microsoft 365", hint: "Parte de la suite Office." },
  teams: { category: "Comunicación", hint: "Herramientas de chat y videollamadas." },
  onedrive: { category: "Microsoft 365", hint: "Sincronización con la nube." },
  canva: { category: "Creatividad", hint: "Diseño rápido para marketing." },
  figma: { category: "Creatividad", hint: "Prototipos de UI/UX." },
  vscode: { category: "Desarrollo", hint: "Editores de código multiplataforma." },
  pycharm: { category: "Desarrollo", hint: "IDEs especializados." },
  git: { category: "Desarrollo", hint: "Control de versiones." },
  node: { category: "Desarrollo", hint: "Runtimes y entornos." },
  wslubuntu: { category: "Desarrollo", hint: "Capas Linux para Windows." },
  slack: { category: "Comunicación", hint: "Chat corporativo." },
  zoom: { category: "Comunicación", hint: "Videollamadas y webinars." },
  googledrive: { category: "Productividad", hint: "Sincronización de archivos." },
  anydesk: { category: "Soporte remoto", hint: "Control remoto de equipos." },
  freshdesk: { category: "Soporte remoto", hint: "ITSM y soporte." },
  crowdstrike: { category: "Seguridad", hint: "EDR y protección avanzada." },
  defender: { category: "Seguridad", hint: "Protección Microsoft." },
};

const DEFAULT_GUIDE = { category: "Otros", hint: "Utilidades generales para complementar tus perfiles." };
const TOOL_LOGOS: Record<string, string> = {
  edge: "https://logo.clearbit.com/microsoft.com",
  brave: "https://logo.clearbit.com/brave.com",
  libreoffice: "https://logo.clearbit.com/libreoffice.org",
  excel: "https://logo.clearbit.com/excel.office.com",
  word: "https://logo.clearbit.com/word.office.com",
  powerpoint: "https://logo.clearbit.com/powerpoint.office.com",
  teams: "https://logo.clearbit.com/teams.microsoft.com",
  onedrive: "https://logo.clearbit.com/microsoft.com",
  canva: "https://logo.clearbit.com/canva.com",
  figma: "https://logo.clearbit.com/figma.com",
  vscode: "https://logo.clearbit.com/visualstudio.com",
  pycharm: "https://logo.clearbit.com/jetbrains.com",
  git: "https://logo.clearbit.com/git-scm.com",
  node: "https://logo.clearbit.com/nodejs.org",
  wslubuntu: "https://logo.clearbit.com/ubuntu.com",
  slack: "https://logo.clearbit.com/slack.com",
  zoom: "https://logo.clearbit.com/zoom.us",
  googledrive: "https://logo.clearbit.com/google.com",
  anydesk: "https://logo.clearbit.com/anydesk.com",
  freshdesk: "https://logo.clearbit.com/freshdesk.com",
  crowdstrike: "https://logo.clearbit.com/crowdstrike.com",
  defender: "https://logo.clearbit.com/microsoft.com",
};
const SUGGESTED_TOOLS = ["edge", "teams", "excel", "vscode", "slack", "canva"];

export function ProfileForm({ mode, profileId, initialValues, tools }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: initialValues?.name ?? "",
    industry: initialValues?.industry ?? "Escolar",
    os: initialValues?.os ?? "windows",
    toolIds: new Set(initialValues?.toolIds ?? []),
    wallpaper: {
      url: initialValues?.wallpaper?.url ?? "",
      locked: initialValues?.wallpaper?.locked ?? false,
    },
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    const needle = search.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.os === formState.os &&
        (tool.name.toLowerCase().includes(needle) ||
          (TOOL_GUIDE[tool.id]?.category.toLowerCase().includes(needle) ?? false)),
    );
  }, [tools, formState.os, search]);

  const groupedTools = useMemo(() => {
    const map = new Map<string, { hint: string; tools: Tool[] }>();
    filteredTools.forEach((tool) => {
      const info = TOOL_GUIDE[tool.id] ?? DEFAULT_GUIDE;
      const entry = map.get(info.category);
      if (entry) entry.tools.push(tool);
      else map.set(info.category, { hint: info.hint, tools: [tool] });
    });
    return Array.from(map.entries()).map(([category, payload]) => ({ category, ...payload }));
  }, [filteredTools]);

  const categories = useMemo(
    () => ["Todos", ...new Set(groupedTools.map((group) => group.category))],
    [groupedTools],
  );

  const toggleTool = (id: string) => {
    setFormState((prev) => {
      const next = new Set(prev.toolIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, toolIds: next };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: formState.name.trim(),
      industry: formState.industry,
      os: formState.os,
      toolIds: Array.from(formState.toolIds),
      wallpaper: {
        url: formState.wallpaper.url.trim() || null,
        locked: formState.wallpaper.locked,
      },
    };
    const parsed = profileSchema.safeParse(payload);
    if (!parsed.success) {
      toast({ title: "Revisa el formulario", description: parsed.error.issues[0].message });
      return;
    }
    setLoading(true);
    const method = mode === "create" ? "POST" : "PATCH";
    const url = mode === "create" ? "/api/profiles" : `/api/profiles/${profileId}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);

    if (!res.ok) {
      if (res.status === 429) {
        toast({
          title: "Muchas solicitudes",
          description: "Espera unos segundos y vuelve a intentarlo (límite anti-spam).",
          variant: "destructive",
        });
        return;
      }
      const data = await res.json().catch(() => ({}));
      toast({
        title: "Error",
        description: data?.message ?? "No pudimos guardar el perfil.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: mode === "create" ? "Perfil creado" : "Perfil actualizado",
      variant: "success",
    });
    router.push("/dashboard/profiles");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del perfil</Label>
        <Input
          id="name"
          value={formState.name}
          onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="PC Escolar básico"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Rubro</Label>
          <Select
            id="industry"
            value={formState.industry}
            onChange={(e) => setFormState((prev) => ({ ...prev, industry: e.target.value }))}
          >
            {industries.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="os">Sistema operativo</Label>
          <Select
            id="os"
            value={formState.os}
            onChange={(e) => {
              const nextOs = e.target.value;
              const allowedIds = new Set(tools.filter((tool) => tool.os === nextOs).map((tool) => tool.id));
              setFormState((prev) => ({
                ...prev,
                os: nextOs,
                toolIds: new Set(Array.from(prev.toolIds).filter((id) => allowedIds.has(id))),
              }));
            }}
          >
            {operatingSystems.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Fondo corporativo</p>
          <p className="text-xs text-slate-500">
            Define una imagen que se aplicará como fondo de pantalla por defecto en los dispositivos que usen este perfil.
          </p>
          <Input
            type="url"
            placeholder="https://..."
            value={formState.wallpaper.url}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, wallpaper: { ...prev.wallpaper, url: e.target.value } }))
            }
          />
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <Checkbox
              checked={formState.wallpaper.locked}
              onChange={() =>
                setFormState((prev) => ({
                  ...prev,
                  wallpaper: { ...prev.wallpaper, locked: !prev.wallpaper.locked },
                }))
              }
            />
            Bloquear cambios desde el dispositivo
          </label>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Herramientas para instalar</Label>
          <button
            type="button"
            className="text-xs font-semibold text-slate-500 underline"
            onClick={() => setShowTutorial((prev) => !prev)}
          >
            {showTutorial ? "Ocultar tutorial" : "Ver tutorial"}
          </button>
        </div>
        {showTutorial && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">Cómo usar esta sección</p>
            <ul className="mt-2 space-y-1">
              <li>- Usa el buscador para filtrar por nombre o categoría (ej. “Excel”, “Seguridad”).</li>
              <li>- Cada bloque agrupa herramientas similares y explica cuándo se usan.</li>
              <li>- Cambia el sistema operativo para ver sólo las apps compatibles.</li>
            </ul>
          </div>
        )}
        <input
          type="search"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Buscar (ej. Excel, Canva, Seguridad...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!search && (
          <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-amber-800">Sugeridos</p>
              <p className="text-xs text-amber-700">Los más usados para dejar un PC listo</p>
            </div>
            <div className="flex snap-x gap-3 overflow-x-auto pb-2">
              {filteredTools
                .filter((tool) => SUGGESTED_TOOLS.includes(tool.id))
                .map((tool) => (
                  <label
                    key={tool.id}
                    className="flex min-w-[220px] cursor-pointer items-center gap-3 rounded-2xl border border-white/50 bg-white p-3 shadow-sm"
                  >
                    <Checkbox checked={formState.toolIds.has(tool.id)} onChange={() => toggleTool(tool.id)} />
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                        <img
                          src={TOOL_LOGOS[tool.id] ?? "https://logo.clearbit.com/microsoft.com"}
                          alt={tool.name}
                          className="h-8 w-8 object-cover"
                        />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{tool.name}</p>
                        <p className="text-xs text-slate-500">{(TOOL_GUIDE[tool.id] ?? DEFAULT_GUIDE).category}</p>
                      </div>
                    </div>
                  </label>
                ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category === "Todos" ? null : category)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedCategory === category || (category === "Todos" && !selectedCategory)
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          {groupedTools.length === 0 && (
            <p className="text-sm text-slate-500">No hay herramientas para este sistema o búsqueda.</p>
          )}
          {groupedTools
            .filter((group) => !selectedCategory || group.category === selectedCategory)
            .map((group) => (
              <div key={group.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">{group.category}</p>
                  <p className="text-xs text-slate-500">{group.hint}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {group.tools.map((tool) => (
                    <label
                      key={tool.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 shadow-sm"
                    >
                      <Checkbox checked={formState.toolIds.has(tool.id)} onChange={() => toggleTool(tool.id)} />
                      <div className="flex gap-3">
                        <span className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                          <img
                            src={TOOL_LOGOS[tool.id] ?? "https://logo.clearbit.com/microsoft.com"}
                            alt={tool.name}
                            className="h-8 w-8 object-cover"
                          />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{tool.name}</p>
                          <p className="text-xs text-slate-500">
                            {tool.type}
                            {tool.installer ? ` · ${tool.installer}` : ""}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? "Guardando..." : mode === "create" ? "Crear perfil" : "Guardar cambios"}
      </Button>
    </form>
  );
}

