"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";

type UserSummary = {
  email: string;
  role: string;
  orgName?: string;
};

type ProfileOption = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export function UserInfoPanel({ open, onClose, onLogout }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, profilesRes] = await Promise.all([
          fetch("/api/me/info"),
          fetch("/api/profiles"),
        ]);
        if (userRes.ok) {
          const info = await userRes.json();
          setSummary(info);
        }
        if (profilesRes.ok) {
          const data = await profilesRes.json();
          setProfiles(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open]);

  const handleSwitchProfile = async () => {
    if (!selectedProfile) return;
    const res = await fetch("/api/me/switch-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: selectedProfile }),
    });
    if (res.ok) {
      toast({ title: "Perfil cambiado", variant: "success" });
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      toast({ title: "No pudimos cambiar el perfil", description: data?.message, variant: "destructive" });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold">Mi cuenta</p>
          <button className="text-xs text-slate-500 hover:text-slate-900" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="space-y-4 p-4 text-sm">
          {loading ? (
            <p className="text-slate-500">Cargando...</p>
          ) : (
            <>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{summary?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rol</p>
                <p className="font-medium text-slate-900">{summary?.role ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Organización</p>
                <p className="font-medium text-slate-900">{summary?.orgName ?? "—"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Cambiar perfil</p>
                <select
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                >
                  <option value="">Selecciona un perfil</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
                <button
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={handleSwitchProfile}
                  disabled={!selectedProfile}
                >
                  Cambiar perfil
                </button>
              </div>
              <button
                className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
