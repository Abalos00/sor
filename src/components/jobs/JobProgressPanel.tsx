"use client";

import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { getStatusLabel, normalizeStatus } from "@/lib/status";

type PlannedTask = {
  id: string;
  type: string;
  command: string;
};

type RemoteTask = {
  id: string;
  toolId: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
};

type Props = {
  jobId: string;
  plannedTasks: PlannedTask[];
  initialStatus: {
    status: string;
    tasks: RemoteTask[];
  };
};

type ApiJobResponse = {
  status: string;
  tasks?: RemoteTask[];
};

export function JobProgressPanel({ jobId, plannedTasks, initialStatus }: Props) {
  const [status, setStatus] = useState<string>(() => normalizeStatus(initialStatus.status));
  const [tasks, setTasks] = useState<RemoteTask[]>(
    (initialStatus.tasks ?? []).map((task) => ({
      ...task,
      status: normalizeStatus(task.status),
    })),
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const tick = async () => {
      const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      if (res.ok) {
        const data: ApiJobResponse = await res.json();
        setStatus(normalizeStatus(data.status));
        setTasks(
          (data.tasks ?? []).map((task) => ({
            id: task.id,
            toolId: task.toolId,
            status: normalizeStatus(task.status),
            startedAt: task.startedAt ?? null,
            finishedAt: task.finishedAt ?? null,
          })),
        );
        setLastUpdated(new Date());
      }
    };
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  const taskByTool = useMemo(() => {
    const map = new Map<string, RemoteTask>();
    tasks.forEach((task) => {
      const key = task.toolId || task.id;
      map.set(key, task);
    });
    return map;
  }, [tasks]);

  const displayStatus = getStatusLabel(status) || status;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-slate-500">Estado general</p>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={status}>{displayStatus}</StatusBadge>
            {lastUpdated && (
              <span className="text-xs text-slate-500">
                Actualizado {lastUpdated.toLocaleTimeString("es-AR")}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {plannedTasks.map((task) => {
          const snapshot = taskByTool.get(task.id);
          const snapshotStatus = normalizeStatus(snapshot?.status ?? "encola");
          const label = getStatusLabel(snapshotStatus) || snapshotStatus;
          return (
            <div
              key={task.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{task.id}</p>
                <StatusBadge status={snapshotStatus}>{label}</StatusBadge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {snapshotStatus === "running" && snapshot?.startedAt
                  ? `Comenzo ${new Date(snapshot.startedAt).toLocaleTimeString("es-AR")}`
                  : snapshotStatus === "succeeded" && snapshot?.finishedAt
                  ? `Finalizo ${new Date(snapshot.finishedAt).toLocaleTimeString("es-AR")}`
                  : "Aun no iniciado"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

