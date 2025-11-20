"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";

type Props = {
  initialWebhook: string;
};

export default function ReportsClient({ initialWebhook }: Props) {
  const { toast } = useToast();
  const [webhook, setWebhook] = useState(initialWebhook);
  const [saving, setSaving] = useState(false);

  const downloadCsv = (days: number) => {
    const link = document.createElement("a");
    link.href = `/api/reports/jobs?days=${days}`;
    link.download = `jobs-${days}d.csv`;
    link.click();
  };

  const saveWebhook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/org/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl: webhook }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ title: "No pudimos guardar", description: data?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Configuración actualizada", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Descargar CSV de jobs</h2>
        <p className="mt-1 text-sm text-slate-500">
          Obtén un listado detallado de los jobs ejecutados en los últimos días.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {[7, 30, 90].map((days) => (
            <Button key={days} variant="outline" onClick={() => downloadCsv(days)}>
              Últimos {days} días
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Webhooks externos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cuando un job cambie de estado enviaremos un POST a esta URL (útil para Slack, Teams o herramientas
          internas). Deja vacío para desactivar.
        </p>
        <form onSubmit={saveWebhook} className="mt-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="webhook">URL del webhook</Label>
            <Input
              id="webhook"
              placeholder="https://hooks.slack.com/services/..."
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
