"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_MS = 30 * 60 * 1000;
const GRACE_MS = 2 * 60 * 1000;

type Props = {
  onTimeout: () => void;
};

export function SessionIdleGuard({ onTimeout }: Props) {
  const [promptVisible, setPromptVisible] = useState(false);
  const [countdown, setCountdown] = useState(GRACE_MS / 1000);
  const idleTimerRef = useRef<number | null>(null);
  const graceTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const promptRef = useRef(false);

  const clearGraceTimers = () => {
    if (graceTimerRef.current) {
      window.clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      promptRef.current = true;
      setPromptVisible(true);
      setCountdown(GRACE_MS / 1000);
      graceTimerRef.current = window.setTimeout(() => {
        clearGraceTimers();
        onTimeout();
      }, GRACE_MS);
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((value) => Math.max(0, value - 1));
      }, 1000);
    }, IDLE_MS);
  }, [onTimeout]);

  const handleActivity = useCallback(() => {
    if (promptRef.current) return;
    startIdleTimer();
  }, [startIdleTimer]);

  const handleStay = () => {
    clearGraceTimers();
    promptRef.current = false;
    setPromptVisible(false);
    startIdleTimer();
  };

  useEffect(() => {
    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleActivity));
    startIdleTimer();
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      clearGraceTimers();
    };
  }, [handleActivity, startIdleTimer]);

  useEffect(() => {
    promptRef.current = promptVisible;
  }, [promptVisible]);

  if (!promptVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Inactividad</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Sigues presente?</h3>
        <p className="mt-2 text-sm text-slate-600">
          No detectamos actividad en los ultimos 30 minutos. Si no respondes en 2 minutos cerraremos tu sesion por
          seguridad.
        </p>
        <p className="mt-4 text-sm font-semibold text-slate-900">Tiempo restante: {countdown}s</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleStay}
            className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Sigo aqui
          </button>
          <button
            onClick={onTimeout}
            className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cerrar sesion ahora
          </button>
        </div>
      </div>
    </div>
  );
}
