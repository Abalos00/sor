"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  email: string;
  role: string;
};

const roles = [
  { value: "ADMIN", label: "Administrador" },
  { value: "TECH", label: "Técnico" },
];

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const { toast } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [formState, setFormState] = useState({ email: "", role: "TECH" });
  const [inviteLoading, setInviteLoading] = useState(false);

  const inviteUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviteLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formState),
    });
    setInviteLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ title: "No pudimos invitar al usuario", description: data?.message, variant: "destructive" });
      return;
    }
    const data = await res.json();
    setUsers((prev) => [...prev, data.user]);
    setFormState({ email: "", role: "TECH" });
    toast({
      title: "Usuario creado",
      description: `Contraseña temporal: ${data.tempPassword}`,
      variant: "success",
    });
  };

  const updateRole = async (id: string, role: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ title: "No pudimos actualizar el rol", description: data?.message, variant: "destructive" });
      return;
    }
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role } : user)));
    toast({ title: "Rol actualizado", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={inviteUser} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="persona@empresa.com"
            value={formState.email}
            onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Rol</Label>
          <Select
            id="invite-role"
            value={formState.role}
            onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={inviteLoading} className="md:col-span-3">
          {inviteLoading ? "Creando..." : "Invitar usuario"}
        </Button>
      </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Miembros actuales</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="py-2">Email</th>
                  <th className="py-2">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="py-2 font-medium text-slate-900">{user.email}</td>
                    <td className="py-2">
                    <select
                      className="rounded-md border border-slate-200 px-2 py-1 text-sm"
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
