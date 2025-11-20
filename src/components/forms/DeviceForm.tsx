"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { deviceSchema } from "@/lib/validators";
import { useToast } from "@/components/ui/toast-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const operatingSystems = [
  { value: "windows", label: "Windows" },
  { value: "macos", label: "macOS" },
  { value: "linux", label: "Linux" },
] as const;

export function DeviceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState({ name: "", os: "windows" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = deviceSchema.safeParse(formState);
    if (!parsed.success) {
      toast({ title: "Revisa el formulario", description: parsed.error.issues[0].message });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({
        title: "No pudimos registrar el dispositivo",
        description: data?.message ?? "Intenta nuevamente",
        variant: "destructive",
      });
      return;
    }

    setFormState({ name: "", os: "windows" });
    toast({ title: "Dispositivo registrado", variant: "success" });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="device-name">Nombre del dispositivo</Label>
        <Input
          id="device-name"
          placeholder="PC-LAB-001"
          value={formState.name}
          onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="device-os">Sistema operativo</Label>
        <Select
          id="device-os"
          value={formState.os}
          onChange={(e) => setFormState((prev) => ({ ...prev, os: e.target.value }))}
        >
          {operatingSystems.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? "Guardando..." : "Registrar dispositivo"}
      </Button>
    </form>
  );
}

