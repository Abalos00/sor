"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { jobSchema } from "@/lib/validators";
import { useToast } from "@/components/ui/toast-provider";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ProfileOption = {
  id: string;
  name: string;
  os: string;
};

type DeviceOption = {
  id: string;
  name: string;
  os: string;
};

type JobFormProps = {
  profiles: ProfileOption[];
  devices: DeviceOption[];
};

export function JobForm({ profiles, devices }: JobFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    profileId: profiles[0]?.id ?? "",
    deviceId: "",
    deviceName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = jobSchema.safeParse(formState);
    if (!parsed.success) {
      toast({
        title: "Revisa el formulario",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({
        title: "Error",
        description: data?.message ?? "No pudimos crear el job.",
        variant: "destructive",
      });
      return;
    }

    const job = await res.json();
    toast({ title: "Job encolado", variant: "success" });
    router.push(`/dashboard/jobs/${job.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="profile">Perfil</Label>
        <Select
          id="profile"
          value={formState.profileId}
          onChange={(e) => setFormState((prev) => ({ ...prev, profileId: e.target.value }))}
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name} ({profile.os})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="device-select">Dispositivo registrado (opcional)</Label>
        <Select
          id="device-select"
          value={formState.deviceId}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              deviceId: e.target.value,
              deviceName: e.target.value ? "" : prev.deviceName,
            }))
          }
        >
          <option value="">-- Seleccionar dispositivo --</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} ({device.os})
            </option>
          ))}
        </Select>
        <p className="text-xs text-slate-500">O ingresa un nombre para crear un agente nuevo:</p>
        <Input
          id="device"
          placeholder="PC-LAB-01"
          value={formState.deviceName}
          onChange={(e) => setFormState((prev) => ({ ...prev, deviceName: e.target.value }))}
          disabled={Boolean(formState.deviceId)}
        />
        <p className="text-xs text-slate-500">
          Si no existe registraremos el dispositivo automaticamente.
        </p>
      </div>
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? "Creando..." : "Crear Job"}
      </Button>
    </form>
  );
}

